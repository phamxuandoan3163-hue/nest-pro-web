export default function Home() {
  return (
    <main style={{fontFamily:"Arial,sans-serif",maxWidth:720,margin:"56px auto",padding:"0 20px",color:"#1a2022"}}>
      <p style={{letterSpacing:2,fontSize:12,color:"#596366"}}>NEST-PRO · ONLINE SERVICES</p>
      <h1>Nest-Pro License API</h1>
      <p>This service validates the server time used by the Nest-Pro Laser seven-day review trial.</p>
      <p><a href="/api/npl-trial/health">Check API health</a></p>
      <p style={{fontSize:13,color:"#687174"}}>Trial start and expiry timestamps are stored in the local Illustrator user-data folder. This review endpoint does not provide a server-persisted anti-reset registry.</p>
    </main>
  );
}
