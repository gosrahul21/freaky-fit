import { hapticSelection } from '../../../utils/haptics';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Star } from 'lucide-react-native';
import { Header } from '../Header';
import { ContinueButton } from '../ContinueButton';

export function SocialProof({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const renderStars = () => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} color="#ffb400" fill="#ffb400" />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header currentStep={1} showBack={true} onBack={onBack} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>
          We've helped <Text style={styles.highlightText}>1,94,578</Text> people like you achieve their goals!
        </Text>

        <View style={styles.testimonialsFeed}>
          {/* Card 1 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.userInfo}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMLAVdqgBCOlMUJOwVeMg-RVxMjfxQZiD7LND0BiWxEdaO7kf6kShCzw243XfxCtXj2SIAykQxk2vBvyp_xKip4O0RDUlZvZjSO-IVGkfofH77PM0Jlwt2wC4oeGRIeOoar1B_LBJ1zIQAyoJRVUnV7jRF7pYA46Y3RKHYDXVv77sfwrJixOJk5V7PSOvwlnBbyrdoTsHncdOhJHiL6bMQwk7eRLrfxlPYomvgXrf3yfdYlHKn5bJ8' }} 
                  style={styles.avatar} 
                />
                <View>
                  <Text style={styles.userName}>Connie</Text>
                  <View style={styles.badgeContainer}>
                    <View style={styles.dot} />
                    <Text style={styles.badgeText}>lost 38 lbs</Text>
                  </View>
                </View>
              </View>
              {renderStars()}
            </View>
            <Text style={styles.quote}>
              "After 3 months with <Text style={styles.boldText}>FreakyFit</Text>, my proudest win isn't just the fat loss — it's finally having every workout I save in one place."
            </Text>
          </View>

          {/* Card 2 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.userInfo}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCewANwyVBvZ-edHaeG4YVtGH4H2RfnaJsN3PwzkNGg-5rzubIk3bNViJEGQiTOwf6ugp5mENSfFsRUWHFs7zT8OGE9ddsIT-zxk-zxWRt0udqTj4-6xSnmDg2T43_f8TbqgvYMCoSB_zKuWLG_ut-oBdp53rgRPgL8xErHXjwGWtfw1uX4TqBBmrwAL16liUJu9iyEDdUe9oKf_BaKoU-UamvfTKOZF8IFA375fMIAa6Fy7zoUEgdJ' }} 
                  style={styles.avatar} 
                />
                <View>
                  <Text style={styles.userName}>Marcus</Text>
                  <View style={styles.badgeContainer}>
                    <View style={styles.dot} />
                    <Text style={styles.badgeText}>gained 8 kg muscle</Text>
                  </View>
                </View>
              </View>
              {renderStars()}
            </View>
            <Text style={styles.quote}>
              "I used to lose great workouts in my TikTok saves. Now <Text style={styles.boldText}>FreakyFit</Text> turns any video into a plan I actually follow."
            </Text>
          </View>

          {/* Card 3 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.userInfo}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9xQ074NQIqpBcO6eIe_LG55q1ygE0DoHwY6g6n13Jj8NmEpXBvIJ1SLzLniRzioknTi9X6yc_QhyVMvkEMVamshS_fkcB5gDfwmAXC9yb5pD7NGoUHkuwY71XiLZ0b-oQCaAraz9YyRvcAk5L_but4GG2-vc6f4JFG-2BgU-4kltAECMgjPcjFC2XcmcdxzZbGSqZUV-zbyFr6Q0wy2qjLhUmRic_AhCMgdQW7ENSJyn4zBmZVOeb' }} 
                  style={styles.avatar} 
                />
                <View>
                  <Text style={styles.userName}>Aisha</Text>
                  <View style={styles.badgeContainer}>
                    <View style={styles.dot} />
                    <Text style={styles.badgeText}>saved 140+ routines</Text>
                  </View>
                </View>
              </View>
              {renderStars()}
            </View>
            <Text style={styles.quote}>
              "Being able to pull workouts straight from Instagram without retyping sets is a complete gamechanger."
            </Text>
          </View>
        </View>
      </ScrollView>

      <ContinueButton onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 120, // space for fixed button
  },
  headline: {
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 36,
    letterSpacing: -1,
    color: '#0A0A0A',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  highlightText: {
    color: '#ff5e00',
    fontWeight: '900',
  },
  testimonialsFeed: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(240, 242, 245, 0.9)',
    shadowColor: '#121217',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 94, 0, 0.2)',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0A0A0A',
    lineHeight: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  quote: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#334155',
  },
  boldText: {
    fontWeight: '600',
    color: '#0A0A0A',
  },
});
