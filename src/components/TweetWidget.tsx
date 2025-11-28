import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface TweetWidgetProps {
  embedHtml: string;
  tweetUrl: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export const TweetWidget: React.FC<TweetWidgetProps> = ({
  embedHtml,
  tweetUrl,
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  // Start with very small height - will be updated by actual content measurement
  // Each widget starts with the same initial height but will update independently
  const [webViewHeight, setWebViewHeight] = React.useState(50);
  const webViewRef = useRef<WebView>(null);

  const tweetId = React.useMemo(() => {
    if (!tweetUrl) {
      return '';
    }
    const match = tweetUrl.match(/status\/(\d+)/i);
    return match?.[1] ?? '';
  }, [tweetUrl]);

  const escapedEmbedHtml = React.useMemo(() => {
    if (!embedHtml) {
      return '';
    }
    return embedHtml
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$\{/g, '\\${')
      .replace(/<\/script>/gi, '<\\/script>');
  }, [embedHtml]);

  // Inject Twitter widgets script if not already included
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta charset="utf-8">
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
            background-color: transparent;
            overflow-x: hidden;
            overflow-y: visible;
            min-height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
          #tweet-root {
            width: 100%;
            display: block;
            min-height: 60px;
          }
          .twitter-tweet {
            margin: 0 auto !important;
            max-width: 100% !important;
          }
        </style>
      </head>
      <body>
        <div id="tweet-root"></div>
        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
        <script>
          (function() {
            var tweetId = '${tweetId}';
            var fallbackHtml = \`${escapedEmbedHtml}\`;
            var hasFallback = fallbackHtml.length > 0;
            var lastHeight = 0;
            var HEIGHT_BUFFER = 36;
            
            function postHeight(height) {
              if (!height || !window.ReactNativeWebView || !window.ReactNativeWebView.postMessage) {
                return;
              }
              var rounded = Math.ceil(height);
              if (Math.abs(rounded - lastHeight) >= 1) {
                lastHeight = rounded;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'height',
                  height: rounded
                }));
              }
            }
            
            var lastHeightCheck = 0;
            var heightCheckThrottle = 800; // Only check height every 800ms to prevent jitter
            
            function throttledMeasureHeight() {
              var now = Date.now();
              if (now - lastHeightCheck < heightCheckThrottle) {
                return;
              }
              lastHeightCheck = now;
              measureHeight();
            }
            
            var lastHeightCheck = 0;
            var heightCheckThrottle = 800; // Only check height every 800ms to prevent jitter
            
            function measureHeight() {
              var root = document.getElementById('tweet-root');
              var height = 0;
              if (root) {
                var rect = root.getBoundingClientRect();
                height = Math.max(
                  rect.height || 0,
                  (rect.bottom && rect.top) ? rect.bottom - rect.top : 0,
                  root.offsetHeight || 0,
                  root.scrollHeight || 0,
                  root.clientHeight || 0
                );
              }
              
              var iframe = document.querySelector('iframe[src*="twitter"], iframe[src*="x.com"], iframe[id^="twitter-widget"]');
              if (iframe) {
                try {
                  var iframeRect = iframe.getBoundingClientRect();
                  height = Math.max(
                    height,
                    iframeRect.height || 0,
                    (iframeRect.bottom && iframeRect.top) ? iframeRect.bottom - iframeRect.top : 0,
                    iframe.offsetHeight || 0,
                    iframe.scrollHeight || 0,
                    iframe.clientHeight || 0
                  );
                } catch (e) {
                  height = Math.max(height, iframe.offsetHeight || 0, iframe.scrollHeight || 0, iframe.clientHeight || 0);
                }
                var iframeAttr = iframe.getAttribute('height');
                if (iframeAttr) {
                  var parsedIframeHeight = parseInt(iframeAttr, 10);
                  if (!isNaN(parsedIframeHeight) && parsedIframeHeight > 0) {
                    height = Math.max(height, parsedIframeHeight);
                  }
                }
              }
              
              var bodyHeight = Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight,
                document.documentElement.clientHeight
              );
              
              height = Math.max(height, bodyHeight);
              postHeight(height + HEIGHT_BUFFER);
            }
            
            function throttledMeasureHeight() {
              var now = Date.now();
              if (now - lastHeightCheck < heightCheckThrottle) {
                return;
              }
              lastHeightCheck = now;
              measureHeight();
            }
            
            function renderFallback() {
              if (!hasFallback) {
                return;
              }
              var root = document.getElementById('tweet-root');
              if (root) {
                root.innerHTML = fallbackHtml;
                measureHeight();
                setTimeout(throttledMeasureHeight, 800);
                setTimeout(throttledMeasureHeight, 2000);
              }
            }
            
            function renderTweet() {
              if (!tweetId) {
                renderFallback();
                return;
              }
              
              if (window.twttr && window.twttr.widgets && window.twttr.widgets.createTweet) {
                window.twttr.widgets.createTweet(tweetId, document.getElementById('tweet-root'), {
                  align: 'center',
                  dnt: true,
                  conversation: 'none'
                }).then(function() {
                  measureHeight();
                  setTimeout(throttledMeasureHeight, 1000);
                  setTimeout(throttledMeasureHeight, 2500);
                }).catch(function() {
                  renderFallback();
                });
                return;
              }
              
              setTimeout(renderTweet, 120);
            }
            
            function waitForWidgets(attempts) {
              if (attempts > 80) {
                renderFallback();
                return;
              }
              if (window.twttr && window.twttr.widgets && typeof window.twttr.widgets.createTweet === 'function') {
                renderTweet();
                return;
              }
              setTimeout(function() { waitForWidgets(attempts + 1); }, 125);
            }
            
            function ensureTwitterScript() {
              if (window.twttr && window.twttr.widgets) {
                renderTweet();
                return;
              }
              
              var existingScript = document.querySelector('script[data-twitter-script="true"]');
              if (existingScript) {
                if (!existingScript.hasAttribute('data-twitter-hooked')) {
                  existingScript.setAttribute('data-twitter-hooked', 'true');
                  existingScript.addEventListener('load', function() {
                    waitForWidgets(0);
                  });
                }
                waitForWidgets(0);
                return;
              }
              
              var script = document.createElement('script');
              script.src = 'https://platform.twitter.com/widgets.js';
              script.async = true;
              script.charset = 'utf-8';
              script.dataset.twitterScript = 'true';
              script.onload = function() {
                waitForWidgets(0);
              };
              script.onerror = function() {
                renderFallback();
              };
              document.head.appendChild(script);
            }
            
            ensureTwitterScript();
            
            if (window.ResizeObserver) {
              var ro = new ResizeObserver(function() {
                throttledMeasureHeight();
              });
              var rootEl = document.getElementById('tweet-root');
              if (rootEl) {
                ro.observe(rootEl);
              }
            }
            
            var mo = new MutationObserver(function() {
              throttledMeasureHeight();
            });
            mo.observe(document.body, { childList: true, subtree: true });
            
            // Initial measurements - only a few, well-spaced
            measureHeight();
            setTimeout(measureHeight, 1000);
            setTimeout(measureHeight, 3000);
          })();
        </script>
      </body>
    </html>
  `;

  const handleLoadEnd = () => {
    setIsLoading(false);
    
    // Force height measurement after WebView loads
    setTimeout(() => {
      webViewRef.current?.injectJavaScript(`
        (function() {
          var HEIGHT_BUFFER = 36;
          function collect(element, heights) {
            if (!element) return;
            try {
              var rect = element.getBoundingClientRect();
              if (rect && rect.height > 0) {
                heights.push(rect.height);
                heights.push(rect.bottom - rect.top);
              }
            } catch (e) {}
            try {
              if (element.offsetHeight > 0) heights.push(element.offsetHeight);
              if (element.scrollHeight > 0) heights.push(element.scrollHeight);
              if (element.clientHeight > 0) heights.push(element.clientHeight);
            } catch (e) {}
          }
          
          function measure() {
            var heights = [];
            var targets = [
              document.querySelector('.twitter-tweet-rendered'),
              document.querySelector('blockquote.twitter-tweet'),
              document.querySelector('.twitter-tweet'),
              document.querySelector('[data-twitter-tweet-id]'),
              document.querySelector('#tweet-root'),
              document.body
            ];
            targets.forEach(function(el) { collect(el, heights); });
            
            var iframe = document.querySelector('iframe[src*="twitter"], iframe[src*="x.com"], iframe[id^="twitter-widget"]');
            if (iframe) {
              collect(iframe, heights);
              var heightAttr = iframe.getAttribute('height');
              if (heightAttr) {
                var parsed = parseInt(heightAttr, 10);
                if (!isNaN(parsed) && parsed > 0) heights.push(parsed);
              }
            }
            
            var valid = heights.filter(function(h) { return h > 0 && isFinite(h); });
            if (valid.length > 0) {
              var height = Math.max.apply(Math, valid);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'height',
                height: Math.ceil(height + HEIGHT_BUFFER)
              }));
            }
          }
          
          var lastMeasure = 0;
          var measureThrottle = 500;
          function throttledMeasure() {
            var now = Date.now();
            if (now - lastMeasure < measureThrottle) {
              return;
            }
            lastMeasure = now;
            measure();
          }
          
          measure();
          setTimeout(throttledMeasure, 500);
          setTimeout(throttledMeasure, 1500);
          setTimeout(throttledMeasure, 3000);
        })();
        true;
      `);
    }, 100);
    
    onLoad?.();
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    console.warn('TweetWidget load error:', error);
    onError?.(error);
  };

  const handleMessage = React.useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'height' && data.height > 0) {
        // Update height only if change is significant (>5px) to prevent jitter
        const newHeight = data.height;
        setWebViewHeight((prevHeight) => {
          // Update only if height changed significantly (more than 5px)
          // This prevents constant re-renders and layout shifts
          if (newHeight > 0 && (prevHeight === 0 || Math.abs(newHeight - prevHeight) > 5)) {
            return newHeight;
          }
          return prevHeight;
        });
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }, []);

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#1DA1F2" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={[styles.webView, { height: webViewHeight }]}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onMessage={handleMessage}
        injectedJavaScript={`
          (function() {
            var HEIGHT_BUFFER = 36;
            function collect(element, heights) {
              if (!element) return;
              try {
                var rect = element.getBoundingClientRect();
                if (rect && rect.height > 0) {
                  heights.push(rect.height);
                  heights.push(rect.bottom - rect.top);
                }
              } catch (e) {}
              try {
                if (element.offsetHeight > 0) heights.push(element.offsetHeight);
                if (element.scrollHeight > 0) heights.push(element.scrollHeight);
                if (element.clientHeight > 0) heights.push(element.clientHeight);
              } catch (e) {}
            }
            
            function measure() {
              var heights = [];
              var targets = [
                document.querySelector('.twitter-tweet-rendered'),
                document.querySelector('blockquote.twitter-tweet'),
                document.querySelector('.twitter-tweet'),
                document.querySelector('[data-twitter-tweet-id]'),
                document.querySelector('#tweet-root'),
                document.body
              ];
              targets.forEach(function(el) { collect(el, heights); });
              
              var iframe = document.querySelector('iframe[src*="twitter"], iframe[src*="x.com"], iframe[id^="twitter-widget"]');
              if (iframe) {
                collect(iframe, heights);
                var heightAttr = iframe.getAttribute('height');
                if (heightAttr) {
                  var parsed = parseInt(heightAttr, 10);
                  if (!isNaN(parsed) && parsed > 0) heights.push(parsed);
                }
              }
              
              var valid = heights.filter(function(h) { return h > 0 && isFinite(h); });
              if (valid.length > 0) {
                var height = Math.max.apply(Math, valid);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'height',
                  height: Math.ceil(height + HEIGHT_BUFFER)
                }));
              }
            }
            
            measure();
            setTimeout(measure, 150);
            setTimeout(measure, 400);
            setTimeout(measure, 800);
            setTimeout(measure, 1500);
            true;
          })();
        `}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={Platform.OS === 'android'}
        originWhitelist={['*']}
        mixedContentMode="always"
        onShouldStartLoadWithRequest={(request) => {
          // Allow navigation to tweet URL, block others
          if (request.url.includes('twitter.com') || request.url.includes('x.com')) {
            return true;
          }
          return false;
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
    marginVertical: 0,
    marginHorizontal: 0,
    // No overflow hidden - allows each widget to have its natural height
  },
  webView: {
    backgroundColor: 'transparent',
    width: '100%',
    // Height is set dynamically via style prop
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
});
