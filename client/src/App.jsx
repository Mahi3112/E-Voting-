import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import AdminElection from './pages/AdminElection';
import AdminAddCandidate from './pages/AdminAddCandidatePage';
import AdminLiveResults from './pages/AdminLiveResults';
import VotePage from './pages/VotePage';
import SignUp from './pages/SignUpPage';
import LogIn from './pages/LoginPage';
import CreateElectionPage from "./pages/CreateElectionPage";
import VerifyOTP from './pages/Verify-otp';
import Dashboard from './pages/DashboardPage';
import EditElectionPage from './pages/EditElectionPage';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <Router>
        <ToastContainer position="top-center" autoClose={3000} />
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/elections" element={<AdminElection />} />
        <Route path="/admin/elections/:electionId/add-candidate" element={<AdminAddCandidate />} />
        <Route path="/admin/results" element={<AdminLiveResults />} />
        <Route path="/admin/create-election" element={<CreateElectionPage />} />
        <Route path="/admin/elections/:id/edit" element={<EditElectionPage />} />

        {/* User Voting */}
        <Route path="/vote/:electionId" element={<VotePage />} />
        <Route path="/" element={<SignUp />} />
        <Route path="/user/login" element={<LogIn />} />
        <Route path="/user/verify-otp" element={<VerifyOTP />} />
        <Route path="/user/dashboard" element={<Dashboard/>} />
        <Route path="/user/profile" element={<ProfilePage/>} />
        <Route path="/user/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/user/reset-password/:token" element={<ResetPasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;
