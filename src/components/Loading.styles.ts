import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
  },
  skeleton: {
    padding: 16,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  cardSkeleton: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  skeletonImage: {
    height: 192,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 16,
  },
});

export default styles;


