
import {BrowserRouter, Routes, Route } from "react-router-dom";
import 'swiper/css';


import ScrollToTop from "./component/layout/ScrollToTop";
import ProtectedRoute from "./component/ProtectedRoute";
import 'bootstrap/dist/css/bootstrap.min.css';

// Auth Pages
import LoginPage from "./page/auth/login";
import SignupPage from "./page/auth/signup";
import ForgetPass from "./page/auth/forgetpass";

// Course Pages
import CoursePage from "./page/courses/course";
import CourseSingle from "./page/courses/course-single";
import CourseView from "./page/courses/course-view";

// Challenge Pages
import ChallengeList from "./page/challenge/challenge-list";
import SolveChallenge from "./page/challenge/solve-challenge";

// Company Challenges Pages
import CompanyList from "./page/companies/company-list";
import CompanyDetail from "./page/companies/company-detail";
import ConceptDetail from "./page/companies/concept-detail";
import SolveCompanyChallenge from "./page/companies/solve-company-challenge";

// Job Pages
import JobList from "./page/jobs/job-list";
import JobDetail from "./page/jobs/job-detail";

// Profile & Leaderboard Pages
import Profile from "./page/profile/profile";
import Leaderboard from "./page/leaderboard/leaderboard";

// Home Page
import Home from "./page/home/home-4";

// Team Pages
import TeamPage from "./page/team/team";
import TeamSingle from "./page/team/team-single";
import InstructorPage from "./page/team/instructor";

// General Pages
import AboutPage from "./page/about/about";
import ContactPage from "./page/contact/contact";
import SearchPage from "./page/general/search-page";
import SearchNone from "./page/general/search-none";
import ErrorPage from "./page/general/404";



function App() {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<Routes>
				{/* Public Routes */}
				<Route path="/" element={<Home />} />
				<Route path="about" element={<AboutPage />} />
				<Route path="team" element={<TeamPage />} />
				<Route path="team-single" element={<TeamSingle />} />
				<Route path="instructor" element={<InstructorPage />} />
				<Route path="search-page" element={<SearchPage />} />
				<Route path="search-none" element={<SearchNone />} />
				<Route path="contact" element={<ContactPage />} />

				{/* Auth Routes */}
				<Route path="login" element={<LoginPage />} />
				<Route path="signup" element={<SignupPage />} />
				<Route path="forgetpass" element={<ForgetPass />} />

				{/* Protected Routes - Require Authentication and Approval */}
				<Route path="course" element={
					<ProtectedRoute>
						<CoursePage />
					</ProtectedRoute>
				} />
				<Route path="course-single/:id" element={
					<ProtectedRoute>
						<CourseSingle />
					</ProtectedRoute>
				} />
				<Route path="course-view/:courseId" element={
					<ProtectedRoute>
						<CourseView />
					</ProtectedRoute>
				} />

				{/* Challenge Routes - Protected */}
				<Route path="challenges" element={
					<ProtectedRoute>
						<ChallengeList />
					</ProtectedRoute>
				} />
				<Route path="challenge/:slug" element={
					<ProtectedRoute>
						<SolveChallenge />
					</ProtectedRoute>
				} />

				{/* Company Challenges Routes - Protected */}
				<Route path="companies" element={
					<ProtectedRoute>
						<CompanyList />
					</ProtectedRoute>
				} />
				<Route path="companies/:slug" element={
					<ProtectedRoute>
						<CompanyDetail />
					</ProtectedRoute>
				} />
				<Route path="companies/:companySlug/concepts/:conceptSlug" element={
					<ProtectedRoute>
						<ConceptDetail />
					</ProtectedRoute>
				} />
				<Route path="companies/:companySlug/concepts/:conceptSlug/challenges/:challengeSlug/solve" element={
					<ProtectedRoute>
						<SolveCompanyChallenge />
					</ProtectedRoute>
				} />

				{/* Job Routes - Protected */}
				<Route path="jobs" element={
					<ProtectedRoute>
						<JobList />
					</ProtectedRoute>
				} />
				<Route path="jobs/:slug" element={
					<ProtectedRoute>
						<JobDetail />
					</ProtectedRoute>
				} />

				{/* Profile & Leaderboard Routes - Protected */}
				<Route path="profile" element={
					<ProtectedRoute>
						<Profile />
					</ProtectedRoute>
				} />
				<Route path="profile/:userId" element={
					<ProtectedRoute>
						<Profile />
					</ProtectedRoute>
				} />
				<Route path="leaderboard" element={
					<ProtectedRoute>
						<Leaderboard />
					</ProtectedRoute>
				} />

				{/* 404 Route */}
				<Route path="*" element={<ErrorPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
