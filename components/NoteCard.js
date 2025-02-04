import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const NoteCard = ({ title, preview, date, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.preview} numberOfLines={2}>
          {preview}
        </Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  container: {
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  preview: {
    fontSize: 14,
    color: '#666666',
  },
  date: {
    fontSize: 12,
    color: '#999999',
    alignSelf: 'flex-end',
  },
});

export default NoteCard; 