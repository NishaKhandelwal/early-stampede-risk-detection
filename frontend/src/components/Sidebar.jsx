import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Video, AlertTriangle, BarChart2, Menu } from 'lucide-react';

export default function Sidebar({ isExpanded, toggleSidebar }) {
    const links = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Live Monitoring', path: '/monitoring', icon: Video },
        { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
        { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    ];

    return (
        <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '1.5rem 1rem', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                <button
                    onClick={toggleSidebar}
                    style={{
                        background: 'transparent', border: 'none', color: 'var(--text-primary)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0.25rem'
                    }}
                >
                    <Menu size={28} />
                </button>

                {isExpanded && (
                    <div className="flex-center" style={{ gap: '0.75rem' }}>
                        <div style={{
                            width: '32px', height: '32px', backgroundColor: 'var(--accent-yellow)',
                            borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                            color: '#000', fontWeight: 'bold', fontSize: '1rem'
                        }}>SR</div>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', whiteSpace: 'nowrap' }}>Stampede Risk</h2>
                    </div>
                )}
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 0.75rem' }}>
                {links.map((link) => {
                    const Icon = link.icon;
                    return (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                                textDecoration: 'none',
                                transition: 'var(--transition)',
                                fontWeight: isActive ? '600' : '400',
                                borderLeft: isActive ? '4px solid var(--accent-yellow)' : '4px solid transparent',
                                justifyContent: isExpanded ? 'flex-start' : 'center',
                                overflow: 'hidden'
                            })}
                            title={!isExpanded ? link.name : ""}
                        >
                            <div style={{ minWidth: '24px', display: 'flex', justifyContent: 'center' }}>
                                <Icon size={24} color={link.name === 'Alerts' ? 'var(--alert-red)' : 'currentColor'} />
                            </div>
                            {isExpanded && <span style={{ whiteSpace: 'nowrap' }}>{link.name}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {isExpanded && (
                <div style={{ marginTop: 'auto', padding: '1rem', margin: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius)' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>System Status</h4>
                    <div className="flex-between">
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>All Systems</span>
                        <span style={{
                            fontSize: '0.7rem',
                            backgroundColor: 'rgba(46, 204, 113, 0.2)',
                            color: '#2ecc71',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontWeight: 'bold'
                        }}>ONLINE</span>
                    </div>
                </div>
            )}
        </div>
    );
}
