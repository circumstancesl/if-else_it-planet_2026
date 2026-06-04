import "./Header.css";
import NavLink from "./NavLink.jsx";

export default function CuratorNav() {
    return (
        <>
            <NavLink
                to="/curator/moderation"
                exact={false}
                alsoActiveOn={["/curator/users"]}
            >
                Модерация
            </NavLink>
        </>
    );
}