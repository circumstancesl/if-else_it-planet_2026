import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";

export default function EmployerSearchBar({
                                              search,
                                              setSearch,
                                              onSearch,
                                              onOpenFilters,
                                          }) {
    const navigate = useNavigate();

    const createButton = (
        <button
            className="create-btn"
            onClick={() => navigate("/employer/profile/create-event")}
        >
            <img src="/icons/plus.svg" alt="create" />
        </button>
    );

    return (
        <SearchBar
            search={search}
            setSearch={setSearch}
            onSearch={onSearch}
            onOpenFilters={onOpenFilters}
            leftButton={createButton}
            placeholder="Поиск событий, компаний, участников"
        />
    );
}