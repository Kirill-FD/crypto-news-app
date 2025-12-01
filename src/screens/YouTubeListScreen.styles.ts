import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 2,
    paddingVertical: 16,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
  },
  widgetsContainer: {
    paddingHorizontal: 2,
    paddingVertical: 20,
  },
  widgetsTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  widgetsSubtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  widgetCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 16,
  },
  widgetBody: {
    padding: 16,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  widgetDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  widgetMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  widgetMetaText: {
    fontSize: 13,
  },
});

export default styles;


