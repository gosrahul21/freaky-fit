import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function AnalyzeScreen() {
  const router = useRouter();
  
  // Animation for the pinging dot
  const pingAnim = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(86);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pingAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pingAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        })
      ])
    ).start();
    
    // Simulate progress increasing slowly
    const interval = setInterval(() => {
      setProgress(p => {
        if (p < 99) return p + 1;
        return p;
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [pingAnim]);

  const pingScale = pingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5]
  });
  
  const pingOpacity = pingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 0]
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* TopBar */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Imported workout</Text>
          <TouchableOpacity 
            style={styles.closeBtn} 
            onPress={() => router.replace('/home')}
            activeOpacity={0.8}
          >
            <X size={20} color="#1F2937" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Core Progress Section */}
        <View style={styles.mainContent}>
          
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Analyzing the workout...</Text>
            <Text style={styles.statusSubtitle}>AI Motion & Rep Parser</Text>
          </View>

          {/* Kinetic Diagram */}
          <View style={styles.diagramContainer}>
            <View style={styles.nodeContainer}>
              <View style={styles.nodeBox}>
                <Text style={styles.nodeText}>A</Text>
              </View>
              <Text style={styles.nodeLabel}>Source</Text>
            </View>
            
            <View style={styles.svgContainer}>
              <Svg width="100%" height={90} viewBox="0 0 240 70">
                <Path 
                  d="M 16,42 C 20,5 50,5 45,35 C 40,55 75,5 75,35 C 75,55 110,5 110,35 C 110,55 145,5 145,35 C 145,55 175,10 188,40" 
                  fill="none" 
                  stroke="#9ca3af" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  opacity={0.7}
                />
                <Path 
                  d="M 28,45 L 182,45" 
                  stroke="#ff5e00" 
                  strokeDasharray="6 6" 
                  strokeLinecap="round" 
                  strokeWidth={3.5} 
                />
                <Path 
                  d="M 175,39 L 187,45 L 175,51" 
                  stroke="#ff5e00" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3.5} 
                />
              </Svg>
            </View>

            <View style={styles.nodeContainer}>
              <View style={styles.nodeBox}>
                <Text style={styles.nodeText}>B</Text>
              </View>
              <Text style={styles.nodeLabel}>Log</Text>
            </View>
          </View>

          {/* Prominent Percentage Metric */}
          <View style={styles.metricContainer}>
            <View style={styles.percentRow}>
              <Text style={styles.percentNumber}>{progress}</Text>
              <Text style={styles.percentSymbol}>%</Text>
            </View>
            
            {/* Dynamic Kinetic Sub-indicator */}
            <View style={styles.subIndicatorContainer}>
              <View style={styles.pingContainer}>
                <Animated.View style={[
                  styles.pingDotOuter, 
                  { 
                    transform: [{ scale: pingScale }],
                    opacity: pingOpacity
                  }
                ]} />
                <View style={styles.pingDotInner} />
              </View>
              <Text style={styles.subIndicatorText}>Calibrating exercises & sets</Text>
            </View>
          </View>
          
        </View>

        {/* Bottom Action */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.continueBtn} 
            activeOpacity={0.9} 
            onPress={() => router.replace('/home')}
          >
            <Text style={styles.continueBtnText}>Continue in background</Text>
          </TouchableOpacity>
          <View style={styles.homeIndicator} />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0A0A0B',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    width: '100%',
  },
  statusTextContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.5,
  },
  statusSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff5e00',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 8,
  },
  diagramContainer: {
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 48,
    position: 'relative',
    paddingHorizontal: 8,
  },
  nodeContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  nodeBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0A0A0B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nodeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A0A0B',
    fontStyle: 'italic',
  },
  nodeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  metricContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  percentNumber: {
    fontSize: 104,
    fontWeight: '800',
    color: '#0A0A0B',
    letterSpacing: -4,
    lineHeight: 110,
  },
  percentSymbol: {
    fontSize: 72,
    fontWeight: '800',
    color: '#0A0A0B',
    letterSpacing: -2,
  },
  subIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 241, 235, 0.8)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.2)',
    marginTop: 16,
    gap: 8,
  },
  pingContainer: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pingDotOuter: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff5e00',
  },
  pingDotInner: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff5e00',
  },
  subIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff5e00',
    letterSpacing: 0.5,
  },
  footer: {
    width: '100%',
    paddingBottom: 8,
  },
  continueBtn: {
    width: '100%',
    backgroundColor: '#0A0A0B',
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  homeIndicator: {
    width: 120,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 24,
  }
});
