import "./Header.css";
import NavLink from "./NavLink.jsx";

export default function PublicNav() {
    return (
        <>
            <NavLink
                to="/candidate"
                exact={true}
                alsoActiveOn={["/candidate/event"]}
            >
                Соискателям
            </NavLink>
            <NavLink
                to="/employer"
                exact={true}
                alsoActiveOn={["/candidate/event"]}
            >
                Работодателям
            </NavLink>
            <NavLink
            to="/curator"
            exact={true}
            alsoActiveOn={["/candidate/event"]}
        >
                Кураторам
        </NavLink>

        </>
    );
}