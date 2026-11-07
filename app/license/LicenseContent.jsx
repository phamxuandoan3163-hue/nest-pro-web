"use client";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Clock3, ShieldCheck, Zap } from "lucide-react";

const plans=[
 {period:"7 DAYS",name:"Free trial",price:"$0",cadence:"for 7 days",summary:"Test Nova Nesting with your own files before you commit.",details:["7-day trial period","Explore the nesting workflow","Test pattern matching and artwork alignment","Evaluate the workflow on your Illustrator setup"],tag:"START HERE",cta:"View trial details"},
 {period:"30 DAYS",name:"Monthly license",price:"$9.90",originalPrice:"US$14.10/mo",discount:"Save 30%",cadence:"per 30 days",summary:"Flexible access for a production run, a busy month, or occasional projects.",details:["30 days of licensed access","Nesting and artwork matching workflow","Laser Cut workflow, where supported","A practical option for short-term projects"],tag:"FLEXIBLE",cta:"Choose Monthly",priceId:"pri_01m6p22fft85kps6amjeca7jnh"},
 {period:"1 YEAR",name:"Annual license",price:"$63.90",originalPrice:"US$91.30/yr",discount:"Save 30%",cadence:"per year",summary:"Reliable everyday nesting for one workstation, with a full year of access at a lower monthly equivalent.",details:["12 months of licensed access","Use on 1 computer","Access to current Nesting and Laser Cut features","Pay once for the year instead of renewing monthly","Save US$27.40 compared with the original annual price"],tag:"STANDARD",cta:"Choose Yearly",priceId:"pri_01m6p22fr8gvdze7nqpc4v0mz8"},
 {period:"1 YEAR PRO",name:"Annual Pro",price:"$95.90",originalPrice:"US$137.00/yr",discount:"Save 30%",cadence:"per year",summary:"For demanding production: everything in Annual, with faster, more precise nesting designed for longer work sessions and complex files.",details:["Every feature included in Annual","Use on up to 2 computers","Faster, more precise nesting optimization","Designed for longer sessions and complex nesting jobs","A premium workflow for demanding production"],tag:"PRO TIER",cta:"Choose Yearly Pro",priceId:"pri_01m6p22gqb9n68a73ggqdcvsm"}
];

export default function LicenseContent(){
 const [checkoutReady,setCheckoutReady]=useState(false);
 const [checkoutError,setCheckoutError]=useState("");
 useEffect(()=>{
  const token=process.env.NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN;
  if(!token){setCheckoutError("Sandbox checkout is not configured yet.");return;}
  let script;
  const initialize=()=>{
   if(!window.Paddle||window.__novaPaddleSandboxInitialized)return;
   window.Paddle.Environment.set("sandbox");
   window.Paddle.Initialize({token,eventCallback:(event)=>{
    if(event?.name==="checkout.completed") window.location.href="/order-confirmation?provider=paddle";
   }});
   window.__novaPaddleSandboxInitialized=true;
   setCheckoutReady(true);
  };
  if(window.Paddle){initialize();return;}
  script=document.createElement("script");
  script.src="https://cdn.paddle.com/paddle/v2/paddle.js";
  script.async=true;
  script.onload=initialize;
  script.onerror=()=>setCheckoutError("Could not load Paddle checkout. Please try again later.");
  document.head.appendChild(script);
  return ()=>{if(script&&script.parentNode)script.parentNode.removeChild(script);};
 },[]);
 function openCheckout(plan){
  if(!plan.priceId){window.location.href="/tools/nest-pro#workflow";return;}
  if(!checkoutReady||!window.Paddle){setCheckoutError("Sandbox checkout is still loading. Please try again in a moment.");return;}
  setCheckoutError("");
  window.Paddle.Checkout.open({
   items:[{priceId:plan.priceId,quantity:1}],
   customData:{app:"nova-nesting",plan_key:plan.priceId==="pri_01m6p22fft85kps6amjeca7jnh"?"monthly":plan.priceId==="pri_01m6p22fr8gvdze7nqpc4v0mz8"?"annual":"annual_pro"},
   settings:{displayMode:"overlay",theme:"dark",successUrl:window.location.origin+"/order-confirmation?provider=paddle"}
  });
 }
 return <div id="licensing" className="license-page tool-license-content">
  <section className="license-hero shell"><p className="eyebrow">SIMPLE PRICING · BUILT FOR PRODUCTION</p><h2>Spend less time<br/><em>placing. Keep creating.</em></h2><p>Choose the access period that fits your workflow. Try Nova Nesting free for 7 days, pay US$9.90 for 30 days, get Annual for US$63.90 per year on 1 computer, or choose Annual Pro for US$95.90 per year on up to 2 computers with enhanced nesting performance.</p><div className="license-highlights"><span><ShieldCheck/> Clear license periods</span><span><Clock3/> Start with 7 days free</span><span><Zap/> Designed for Illustrator workflows</span></div><a href="#plans" className="license-hero-cta">Compare plans <ArrowRight size={15}/></a></section>
  <section id="plans" className="shell license-options"><div className="license-section-head"><div><p className="eyebrow">PICK YOUR ACCESS</p><h2>One workflow.<br/>Choose your level.</h2></div><p>Choose Annual for everyday nesting on 1 computer, or Annual Pro for 2 computers and a performance-focused workflow for longer sessions and complex jobs.</p></div>
   <div className="license-grid">{plans.map((plan,i)=><article key={plan.period} className={"license-card "+(i===3?"license-card-pro license-card-featured-pro":"")}><div className="license-card-top"><span>{plan.tag}</span>{i===3&&<b>PRO · RECOMMENDED</b>}</div><h3>{plan.period}</h3><strong>{plan.name}</strong><div className="license-price-wrap">{plan.originalPrice&&<div className="license-price-meta"><del>{plan.originalPrice}</del><span className={"license-discount "+(i===3?"license-discount-pro":"")}>{plan.discount}</span></div>}<div className="license-price"><span>{plan.price}</span><small>{plan.cadence}</small></div></div><p>{plan.summary}</p><div className="license-divider"/><ul>{plan.details.map(d=><li key={d}><Check size={14}/>{d}</li>)}</ul><button type="button" onClick={()=>openCheckout(plan)} disabled={Boolean(plan.priceId&&!checkoutReady)} className={"button "+(i===3?"dark":"outline")}>{plan.cta} <ArrowRight size={15}/></button></article>)}</div>
   <p className="license-note">Paid plans use Paddle Sandbox during integration checks. No real payment is taken. A license key is emailed after Paddle confirms the payment.</p>{checkoutError&&<p role="status" className="license-note">{checkoutError}</p>}
  </section>
  <section className="license-how"><div className="shell license-how-inner"><div><p className="eyebrow">A LOW-RISK WAY TO START</p><h2>Try it on<br/>your own files.</h2></div><div className="license-steps"><article><b>01</b><h3>Explore the workflow</h3><p>Review the product overview and requirements before installing.</p></article><article><b>02</b><h3>Test with real patterns</h3><p>Use the trial period to evaluate the workflow with files you know.</p></article><article><b>03</b><h3>Choose your term</h3><p>Pick monthly flexibility or save with a full year of access.</p></article></div></div></section>
  <section className="shell license-faq"><div><p className="eyebrow">GOOD TO KNOW</p><h2>Before you choose.</h2></div><div className="license-faq-list"><details><summary>How much does Nova Nesting cost?<span>+</span></summary><p>Prices are in USD. Annual supports 1 computer; Annual Pro is designed for up to 2 computers. Annual Pro includes up to 2 computers and performance-focused nesting features for demanding production.</p></details><details><summary>How much do I save with the annual plan?<span>+</span></summary><p>The Annual price is US$63.90, with a displayed 30% discount from the regular US$91.30 price.</p></details><details><summary>How do I receive my license?<span>+</span></summary><p>After Paddle confirms the payment, the license system creates a key and emails it to the address used at checkout. You can enter the key in the Nova Nesting Illustrator extension.</p></details><details><summary>Can I test it before paying?<span>+</span></summary><p>The plan structure includes a 7-day trial. View the Nova Nesting product page for current trial availability and access instructions.</p></details></div></section>
  <section className="license-bottom"><div className="shell license-bottom-inner"><div><p className="eyebrow">NEED HELP?</p><h2>Questions about licensing?</h2></div><a className="button dark" href="/support">Contact support <ArrowRight size={15}/></a></div></section>
 </div>;
}
