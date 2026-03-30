import SearchBar from "./SearchBar";

export default function CompactSearchBar({
                                             search,
                                             setSearch,
                                             onSearch,
                                         }) {
    return (
        <SearchBar
            search={search}
            setSearch={setSearch}
            onSearch={onSearch}
            variant="compact"
            placeholder="Поиск..."
        />
    );
}