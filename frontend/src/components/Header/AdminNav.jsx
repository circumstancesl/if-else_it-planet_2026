import "./Header.css";
import NavLink from "./NavLink.jsx";

export default function AdminNav() {
    return (
        <>
            <NavLink
                to="/curator/admin"
                exact={false}
                alsoActiveOn={["/admin/curators"]}
            >
                Администрирование
            </NavLink>
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