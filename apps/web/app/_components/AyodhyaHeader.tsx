export default function AyodhyaHeader() {
  return (
    <header className="ayodhya-header">
      <a className="ayodhya-brand" href="/ayodhya">
        <span>AY</span>
        <div>
          <strong>Ayodhya AI OS</strong>
          <small>PHKD Sovereign Creative Runtime</small>
        </div>
      </a>
      <nav aria-label="Ayodhya AI navigation">
        <a href="/ayodhya">Home</a>
        <a href="/projects/new">New Project</a>
        <a href="/hkd3d">HKD3D</a>
        <a href="/ayodhya/studio">Studio</a>
        <a href="/ayodhya/phkd">PHKD</a>
        <a href="/ayodhya/status">Status</a>
      </nav>
    </header>
  );
}
