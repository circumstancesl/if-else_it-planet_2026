import "./Header.css";
import NavLink from "./NavLink.jsx";

export default function EmployerNav() {
    return (
        <>
            <NavLink
                to="/employer/events"
                exact={false}
                alsoActiveOn={["/employer/event"]}
            >
                События
            </NavLink>
            <NavLink to="/employer/responses" exact={false}>
                Отклики
            </NavLink>
            <NavLink to="/employer/profile" exact={false}>
                Профиль
            </NavLink>
        </>
    );
}