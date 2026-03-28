export const coaches = [
  { id: "COA-101", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80", fullName: "Aarav Shrestha", specialization: "Swing Mechanics", experienceYears: 8, rating: 4.9, reviewsCount: 124, studentsTaught: 210, recommendationValue: "96%" },
  { id: "COA-102", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80", fullName: "Nima Gurung", specialization: "Short Game", experienceYears: 6, rating: 4.8, reviewsCount: 96, studentsTaught: 175, recommendationValue: "92%" },
  { id: "COA-103", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80", fullName: "Sofia Rai", specialization: "Junior Development", experienceYears: 5, rating: 4.7, reviewsCount: 88, studentsTaught: 149, recommendationValue: "90%" },
  { id: "COA-104", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80", fullName: "Kabir Basnet", specialization: "Course Strategy", experienceYears: 10, rating: 4.9, reviewsCount: 142, studentsTaught: 245, recommendationValue: "98%" },
];

export const caddies = [
  { id: "CAD-201", image: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=300&q=80", fullName: "Sanjay Thapa", description: "Reads greens and manages pace effectively.", experience: 7, experienceYears: 7, rating: 4.8, matchesCaddied: 320, specialty: "Green Reading" },
  { id: "CAD-202", image: "https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=300&q=80", fullName: "Pema Lama", description: "Trusted by members for tournament rounds.", experience: 5, experienceYears: 5, rating: 4.7, matchesCaddied: 248, specialty: "Tournament Support" },
  { id: "CAD-203", image: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=300&q=80", fullName: "Bikash KC", description: "Strong yardage calls and club suggestions.", experience: 9, experienceYears: 9, rating: 4.9, matchesCaddied: 410, specialty: "Club Selection" },
  { id: "CAD-204", image: "https://images.unsplash.com/photo-1500080209535-717dd4ebaa6b?auto=format&fit=crop&w=300&q=80", fullName: "Ishan Adhikari", description: "Supports first-time players with calm guidance.", experience: 4, experienceYears: 4, rating: 4.6, matchesCaddied: 165, specialty: "Beginner Support" },
];

export const lessons = [
  { id: "LES-301", title: "Full Swing Analysis", durationMinutes: 60, price: 12000 },
  { id: "LES-302", title: "Short Game Mastery", durationMinutes: 45, price: 9000 },
  { id: "LES-303", title: "Putting Confidence Lab", durationMinutes: 30, price: 6500 },
  { id: "LES-304", title: "On-Course Strategy Session", durationMinutes: 90, price: 18000 },
];

export const bookings = [
  { id: "BKG-401", userName: "Ritesh Karki", type: "Course", assignedTo: "Gokarna Forest", date: "2026-04-02", price: 6000, status: "Completed" },
  { id: "BKG-402", userName: "Anisha Rana", type: "Lesson", assignedTo: "Aarav Shrestha", date: "2026-04-03", price: 12000, status: "Pending" },
  { id: "BKG-403", userName: "Pranav Singh", type: "Caddie", assignedTo: "Bikash KC", date: "2026-04-05", price: 4000, status: "Completed" },
  { id: "BKG-404", userName: "Milan Gautam", type: "Lesson", assignedTo: "Kabir Basnet", date: "2026-04-06", price: 18000, status: "Confirmed" },
  { id: "BKG-405", userName: "Sita Bohara", type: "Course", assignedTo: "Himalayan Golf Club", date: "2026-04-07", price: 5500, status: "Pending" },
];

export const courses = [
  { id: "CRS-501", name: "Gokarna Forest Resort", location: "Kathmandu", totalCoaches: 8, totalCaddies: 12, totalLessons: 16, totalRevenue: 560000, totalBookings: 421, adminName: "Rohan Khadka" },
  { id: "CRS-502", name: "Himalayan Golf Club", location: "Pokhara", totalCoaches: 6, totalCaddies: 10, totalLessons: 12, totalRevenue: 410000, totalBookings: 308, adminName: "Mina Gurung" },
  { id: "CRS-503", name: "Valley Greens", location: "Lalitpur", totalCoaches: 5, totalCaddies: 8, totalLessons: 9, totalRevenue: 295000, totalBookings: 224, adminName: "Sudeep Joshi" },
  { id: "CRS-504", name: "Everest Fairway", location: "Bhaktapur", totalCoaches: 7, totalCaddies: 11, totalLessons: 15, totalRevenue: 470000, totalBookings: 360, adminName: "Anita Lama" },
];

export const activities = [
  { id: "ACT-601", adminName: "Rohan Khadka", courseName: "Gokarna Forest Resort", activityType: "Added Coach", description: "Added Sofia Rai to the coaching team.", date: "2026-03-24", status: "Completed" },
  { id: "ACT-602", adminName: "Mina Gurung", courseName: "Himalayan Golf Club", activityType: "Deleted Lesson", description: "Removed outdated putting clinic schedule.", date: "2026-03-25", status: "Pending" },
  { id: "ACT-603", adminName: "Sudeep Joshi", courseName: "Valley Greens", activityType: "Updated Caddie", description: "Revised Bikash KC availability slots.", date: "2026-03-26", status: "Completed" },
  { id: "ACT-604", adminName: "Anita Lama", courseName: "Everest Fairway", activityType: "Added Lesson", description: "Created new on-course strategy module.", date: "2026-03-27", status: "Completed" },
];

export const courseAdminProfile = {
  fullName: "Rohan Khadka",
  email: "admin@gokarna.com",
  phone: "+977-9800000000",
  courseName: "Gokarna Forest Resort",
  location: "Kathmandu, Nepal",
  description: "Managing course operations, staffing, member experiences, and premium golf services.",
  image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
};

export const superAdminProfile = {
  fullName: "Ava Superadmin",
  email: "superadmin@golfsuite.com",
  role: "Super Admin",
  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
};
