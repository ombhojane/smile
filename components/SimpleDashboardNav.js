import Link from 'next/link';

const SimpleDashboardNav = () => {
  return (
    <div className="flex justify-between items-center">
      <Link href="/" className="btn btn-ghost">
        Home
      </Link>
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn m-1">
          Menu
        </label>
        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/">Logout</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleDashboardNav;
