import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';

const teamMembers = [
  {
    role: 'Executive Director',
    name: 'John Mitchell',
    image: require('@assets/images/executive_director.jpg'),
  },
  {
    role: 'Business Director',
    name: 'Maria Fields',
    image: require('@assets/images/business_director.jpg'),
  },
  {
    role: 'Activities Director',
    name: 'Lena Torres',
    image: require('@assets/images/activities_director.jpg'),
  },
  {
    role: 'Maintenance Director',
    name: 'Jason Carter',
    image: require('@assets/images/maintenance_director.jpg'),
  },
  {
    role: 'Culinary Director',
    name: 'Mike Lopez',
    image: require('@assets/images/culinary_director.jpg'),
  },
  {
    role: 'Director of Sales & Marketing',
    name: 'Kim Dawson',
    image: require('@assets/images/sales_marketing_director.jpg'),
  },
];

export default function Admin() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.subtitle}>Meet our Team</Text>
      <View style={styles.grid}>
        {teamMembers.map((member) => (
          <View key={member.role} style={styles.memberContainer}>
            <Image source={member.image} style={styles.memberImage} />
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberRole}>{member.role}</Text>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact Request</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F3E7',
    padding: 20,
  },
  subtitle: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  memberContainer: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 3,
  },
  memberImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  memberRole: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: '#004aad',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});