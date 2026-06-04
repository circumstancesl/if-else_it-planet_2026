import { Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login.jsx";
import CandidateRegister from "./pages/login/CandidateRegister.jsx";
import CandidateLogin from "./pages/login/CandidateLogin.jsx";
import EmployerRegister from "./pages/login/EmployerRegister.jsx";
import EmployerLogin from "./pages/login/EmployerLogin.jsx";
import Home from "./pages/Home.jsx";
import EmployerEvents from "./pages/employer/events/EmployerEvents.jsx";
import EmployerResponses from "./pages/employer/responses/EmployerResponses.jsx";
import CandidatePage from "./pages/employer/responses/CandidatePage.jsx";
import EventCandidates from "./pages/employer/responses/EventCandidates.jsx";
import EmployerProfile from "./pages/employer/profile/EmployerProfile.jsx";
import CreateEvent from "./pages/employer/profile/CreateEvent.jsx";
import EditProfile from "./pages/employer/profile/EditProfile.jsx";
import ProfileRedirect from "./pages/ProfileRedirect.jsx";
import Favorites from "./pages/candidate/Favorites.jsx";
import CandidateResponses from "./pages/candidate/CandidateResponses.jsx";
import CandidateProfile from "./pages/candidate/CandidateProfile.jsx";
import ChatPage from "./pages/candidate/ChatPage.jsx";
import FriendsPage from "./pages/candidate/friends/FriendsPage.jsx";
import FriendProfilePage from "./pages/candidate/friends/FriendProfilePage.jsx";
import CuratorLogin from "./pages/login/CuratorLogin.jsx";
import EventPage from "./pages/EventPage.jsx";
import EditEvent from "./pages/employer/events/EditEvent.jsx";
import CuratorsAdmin from "./pages/curator/CuratorsAdmin.jsx";
import CuratorUsers from "./pages/curator/CuratorUsers.jsx";

function App() {
    return (
        <Routes>
            {/* Общие страницы */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Редирект на профиль по роли */}
            <Route path="/profile" element={<ProfileRedirect />} />

            {/* Профили по ролям */}
            {/*<Route path="/candidate/profile" element={<CandidateProfile />} />*/}
            <Route path="/employer/profile" element={<EmployerProfile />} />
            {/*<Route path="/mentor/profile" element={<MentorProfile />} />*/}

            {/* Страница События */}
            <Route path="/employer/event/:eventId" element={<EventPage />} />
            <Route path="/candidate/event/:eventId" element={<EventPage />} />

            {/* Аутентификация */}
            <Route path="/candidate-register" element={<CandidateRegister />} />
            <Route path="/candidate-login" element={<CandidateLogin />} />
            <Route path="/employer-register" element={<EmployerRegister />} />
            <Route path="/employer-login" element={<EmployerLogin />} />
            <Route path="/curator-login" element={<CuratorLogin />} />

            {/* Работодатель - события */}
            <Route path="/employer/events" element={<EmployerEvents />} />
            <Route path="/employer/profile/create-event" element={<CreateEvent />} />
            <Route path="/employer/events/edit-event/:eventId" element={<EditEvent/>} />

            {/* Работодатель - отклики */}
            <Route path="/employer/responses" element={<EmployerResponses />} />
            <Route path="/employer/responses/:eventId" element={<EventCandidates />} />
            <Route path="/employer/responses/candidate/:candidateId" element={<CandidatePage />} />

            {/* Работодатель - профиль (редактирование) */}
            <Route path="/employer/profile/edit" element={<EditProfile />} />

            {/* Соискатель */}
            <Route path="/candidate/favorites" element={<Favorites />} />
            <Route path="/candidate/responses" element={<CandidateResponses />} />
            <Route path="/candidate/profile" element={<CandidateProfile />} />
            <Route path="/candidate/chat/:chatId" element={<ChatPage />} />
            <Route path="/candidate/friends" element={<FriendsPage />} />
            <Route path="/candidate/friend/:friendId" element={<FriendProfilePage />} />

            {/* Куратор */}
            <Route path="/admin/curators" element={<CuratorsAdmin />} />
            <Route path="/curator/users" element={<CuratorUsers />} />

        </Routes>
    );
}

export default App;