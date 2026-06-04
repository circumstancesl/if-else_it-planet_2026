import "./Header.css";
import NavLink from "./NavLink.jsx";

export default function CandidateNav() {
    return (
        <>
            <NavLink
                to="/"
                exact={true}
                alsoActiveOn={["/candidate/event"]}
            >
                События
            </NavLink>
            <NavLink to="/candidate/favorites" exact={false}>
                Избранное
            </NavLink>
            <NavLink to="/candidate/responses" exact={false}>
                Отклики
            </NavLink>
            <NavLink to="/candidate/friends" exact={false}>
                Друзья
            </NavLink>
            <NavLink to="/candidate/profile" exact={false}>
                Профиль
            </NavLink>
        </>
    );
}