import NavLink from "./navLink";
export default function Sidebar() {
    return (
        <nav className="w-64 bg-slate-100 p-4 border-r">
            <h2 className="text-xl font-bold mb-6">早餐店管理</h2>
            <div>
                <NavLink href="/menu">菜單管理</NavLink>
                <NavLink href="/todo2">Todo2</NavLink>
                <NavLink href="/">Net.js示範網頁</NavLink>
            </div>
        </nav>
    );
}
