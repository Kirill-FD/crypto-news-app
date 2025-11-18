import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 0,
    margin:0
  },
  image: {
    width: '100%',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tagChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tickersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tickerChip: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tickerSymbol: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 6,
  },
  tickerName: {
    fontSize: 12,
  },
  tickerNamesText: {
    fontSize: 14,
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  errorContainer: {
    marginTop: 16,
  },
  articleContent: {
    marginBottom: 24,
  },
});

export default styles;

