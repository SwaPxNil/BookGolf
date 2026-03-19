import {useState , useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import MatchHistoryScreen from './screens/MatchHistoryScreen';
import ReservationScreen from './screens/Reservation';
import CoachesScreen from './screens/CoachesScreen';
import CaddieScreen from './screens/CaddieScreen';
import ProfileScreen from './screens/ProfileScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import * as Font from "expo-font";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAccessToken } from './api/tokenStorage';
import CoachDetailsScreen from './screens/CoachDetails';
import LessonBookingScreen from './screens/LessonBooking';
import CaddieBookingScreen from './screens/CaddieBooking';
import CoursesScreen from './screens/CoursesScreen';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        Abel: require("./assets/fonts/Abel-Regular.ttf"),
        Bebas: require("./assets/fonts/BebasNeue-Regular.ttf"),
      });
      setLoaded(true);
    }
    loadFonts();
  }, []);

  useEffect(() => {
    async function loadSession() {
      const accessToken = await getAccessToken();
      setIsAuthenticated(Boolean(accessToken));
      setAuthChecked(true);
    }
    loadSession();
  }, []);

  if (!loaded || !authChecked) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <>
              <Stack.Screen
                name="Login"
                options={{
                  presentation: 'transparentModal',
                  animation: 'fade',
                }}
              >
                {(props) => (
                  <LoginScreen
                    {...props}
                    onLoginSuccess={() => setIsAuthenticated(true)}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="home" component={HomeScreen} />
              <Stack.Screen name="MatchHistory" component={MatchHistoryScreen} />
              <Stack.Screen name="ReservationScreen" component={ReservationScreen} />
              <Stack.Screen name="coach" component={CoachesScreen} />
              <Stack.Screen name="match" component={MatchHistoryScreen} />
              <Stack.Screen name="caddie" component={CaddieScreen} />
              <Stack.Screen name="profile" component={ProfileScreen} />
              <Stack.Screen name="SearchScreen" component={SearchScreen} />
              <Stack.Screen name="CoachDetails" component={CoachDetailsScreen}/>
              <Stack.Screen name="LessonBooking" component={LessonBookingScreen}/>
              <Stack.Screen name="CaddieBooking" component={CaddieBookingScreen}/>
              <Stack.Screen name="CourseScreen" component={CoursesScreen}/>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
