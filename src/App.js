import React, { useState, useEffect, useRef } from 'react';

// eslint-disable-next-line
import html2pdf from 'html2pdf.js';

function App() {
  const [clientInfo, setClientInfo] = useState({
    name: '',
    address: '',
    taxId: '',
    phone: '',
    email: ''
  });

  const [vehicleInfo, setVehicleInfo] = useState({
    brand: '',
    model: '',
    licensePlate: ''
  });

  const [companyInfo] = useState({
    name: 'Saolotech di Saolo Domenico',
    address: 'C/DA Cipparello, 31 89034 Bovalino (RC)',
    taxId: '03285270801',
    phone: '333-3535809',
    email: 'domenico.saolo@gmail.com'
  });

  const [jobs, setJobs] = useState([
    { description: '', price: '', vat: 0 }
  ]);

  const [summary, setSummary] = useState({
    totalExclVAT: 0,
    totalVAT: 0,
    totalInclVAT: 0
  });

  const [quoteNumber, setQuoteNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const totalExclVAT = jobs.reduce((acc, job) => acc + parseFloat(job.price || 0), 0);
    const totalVAT = jobs.reduce((acc, job) => acc + (parseFloat(job.price || 0) * (parseFloat(job.vat || 0) / 100)), 0);
    const totalInclVAT = totalExclVAT + totalVAT;
    setSummary({
      totalExclVAT,
      totalVAT,
      totalInclVAT
    });
  }, [jobs]);

  const handleClientInfoChange = (e) => {
    const { name, value } = e.target;
    setClientInfo({
      ...clientInfo,
      [name]: value
    });
  };

  const handleVehicleInfoChange = (e) => {
    const { name, value } = e.target;
    setVehicleInfo({
      ...vehicleInfo,
      [name]: value
    });
  };

  const handleJobChange = (index, e) => {
    const { name, value } = e.target;
    const newJobs = jobs.map((job, i) => (
      i === index ? { ...job, [name]: value } : job
    ));

    if (value === '' && name === 'description' && index !== jobs.length - 1) {
      setJobs(newJobs.filter((_, i) => i !== index));
    } else {
      setJobs(newJobs);
    }

    if (index === jobs.length - 1 && name === 'description' && value !== '') {
      setJobs([...newJobs, { description: '', price: '', vat: 0 }]);
    }
  };

  const pdfRef = useRef();

  const generatePDF = () => {
    setLoading(true);

    const jobsCopy = jobs.slice(0, jobs.length - 1);
    setJobs(jobsCopy);

    setTimeout(() => {
      // Mostra elementi PDF-only e nascondi elementi no-pdf
      const noPdfElements = document.querySelectorAll('.no-pdf');
      noPdfElements.forEach(el => el.style.display = 'none');
      const pdfOnlyElements = document.querySelectorAll('.pdf-only');
      pdfOnlyElements.forEach(el => el.style.display = 'block');

      const element = pdfRef.current;
      const opt = {
        margin: 1,
        filename: `preventivo_${vehicleInfo.brand}_${vehicleInfo.model}_${vehicleInfo.licensePlate}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).output('blob').then((pdfBlob) => {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');

        // Ripristina la visualizzazione originale
        noPdfElements.forEach(el => el.style.display = '');
        pdfOnlyElements.forEach(el => el.style.display = 'none');
        setLoading(false);
        setJobs([...jobsCopy, { description: '', price: '', vat: 0 }]);
      }).catch(() => {
        // Ripristina la visualizzazione originale
        noPdfElements.forEach(el => el.style.display = '');
        pdfOnlyElements.forEach(el => el.style.display = 'none');
        setLoading(false);
        setJobs([...jobsCopy, { description: '', price: '', vat: 0 }]);
      });
    }, 0);
  };


  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc', padding: '1rem' }} ref={pdfRef}>
      <style>
        {`
          .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.5rem;
            z-index: 1000;
          }

          .hidden {
            display: none;
          }

          .loading-spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border-left-color: #09f;
            animation: spin 1s ease infinite;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          .button {
            background-color: #1d4ed8;
            color: #fff;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            min-width: 100px;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .input-group {
            display: flex;
            flex-direction: column;
            margin-bottom: 1rem;
          }

          .input-group label {
            margin-bottom: 0.25rem;
            font-weight: bold;
          }

          .input-group input {
            padding: 0.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.25rem;
          }

          .pdf-only {
            display: none;
          }
        `}
      </style>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>PREVENTIVO</h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'grid', justifyItems: 'start', gridTemplateColumns: 'auto auto', gap: '0.5rem' }}>
            <p style={{ margin: 0 }}>Data:</p>
            <p style={{ margin: 0 }}>{new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
            <label htmlFor="quoteNumber" style={{ margin: 0 }} >N° preventivo:</label>
            <input id="quoteNumber" className="no-pdf" style={{ padding: '0.25rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem', width: '100px' }} value={quoteNumber} onChange={(e) => setQuoteNumber(e.target.value)} />
            <span className="pdf-only" style={{ padding: '0.25rem', width: '100px' }} > {quoteNumber}</span>
          </div>
        </div>
      </header>

      <section style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#fff', padding: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ width: '48%' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>AZIENDA</h2>
          <p><strong >Nome:</strong> {companyInfo.name}</p>
          <p><strong>Indirizzo:</strong> {companyInfo.address}</p>
          <p><strong>P.IVA / C.F:</strong> {companyInfo.taxId}</p>
          <p><strong>Email:</strong> {companyInfo.email}</p>
          <p><strong>Telefono:</strong> {companyInfo.phone}</p>
        </div>
        <div style={{ width: '1px', backgroundColor: '#e2e8f0' }}></div>
        <div style={{ width: '48%' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>CLIENTE</h2>
          <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
            <label className="no-pdf" style={{ width: '30%' }}><strong>Nome:</strong></label>
            <input className="no-pdf" style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} name="name" placeholder="Nome" value={clientInfo.name} onChange={handleClientInfoChange} />
            <span className="pdf-only"><strong>Nome:</strong> {clientInfo.name}</span>
          </div>
          <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
            <label className="no-pdf" style={{ width: '30%' }}><strong>Indirizzo:</strong></label>
            <input className="no-pdf" style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} name="address" placeholder="Indirizzo" value={clientInfo.address} onChange={handleClientInfoChange} />
            <span className="pdf-only"><strong>Indirizzo:</strong> {clientInfo.address}</span>
          </div>
          <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
            <label className="no-pdf" style={{ width: '30%' }}><strong>P.IVA / C.F:</strong></label>
            <input className="no-pdf" style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} name="taxId" placeholder="P.IVA / C.F" value={clientInfo.taxId} onChange={handleClientInfoChange} />
            <span className="pdf-only"><strong>P.IVA / C.F:</strong> {clientInfo.taxId}</span>
          </div>
          <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
            <label className="no-pdf" style={{ width: '30%' }}><strong>Email:</strong></label>
            <input className="no-pdf" style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} name="email" placeholder="Email" value={clientInfo.email} onChange={handleClientInfoChange} />
            <span className="pdf-only"><strong>Email:</strong> {clientInfo.email}</span>
          </div>
          <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
            <label className="no-pdf" style={{ width: '30%' }}><strong>Telefono:</strong></label>
            <input className="no-pdf" style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} name="phone" placeholder="Telefono" value={clientInfo.phone} onChange={handleClientInfoChange} />
            <span className="pdf-only"><strong>Telefono:</strong> {clientInfo.phone}</span>
          </div>
        </div>
      </section>
      <section style={{ backgroundColor: '#fff', padding: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>DETTAGLI VEICOLO</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
          <div className="input-group">
            <label htmlFor="brand" className="no-pdf">Marca Auto:</label>
            <input className="no-pdf" id="brand" name="brand" placeholder="Marca Auto" value={vehicleInfo.brand} onChange={handleVehicleInfoChange} />
            <span className="pdf-only"><strong>Marca Auto:</strong> {vehicleInfo.brand}</span>
          </div>
          <div className="input-group">
            <label htmlFor="model" className="no-pdf">Modello Auto:</label>
            <input className="no-pdf" id="model" name="model" placeholder="Modello Auto" value={vehicleInfo.model} onChange={handleVehicleInfoChange} />
            <span className="pdf-only"><strong>Modello Auto:</strong> {vehicleInfo.model}</span>
          </div>
          <div className="input-group">
            <label htmlFor="licensePlate" className="no-pdf">Targa Auto:</label>
            <input className="no-pdf" id="licensePlate" name="licensePlate" placeholder="Targa Auto" value={vehicleInfo.licensePlate} onChange={handleVehicleInfoChange} />
            <span className="pdf-only"><strong>Targa Auto:</strong> {vehicleInfo.licensePlate}</span>
          </div>
        </div>
      </section>
      <section style={{ backgroundColor: '#fff', padding: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>DESCRIZIONE DEI LAVORI</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ fontWeight: '600' }}>ID</div>
          <div style={{ fontWeight: '600' }}>DESCRIZIONE</div>
          <div style={{ fontWeight: '600' }}>PREZZO</div>
          <div style={{ fontWeight: '600' }}>ALIQUOTA IVA</div>
        </div>
        {jobs.map((job, index) => (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
            <div>{index + 1}</div>
            <input className="no-pdf" style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} name="description" placeholder="Descrizione" value={job.description} onChange={(e) => handleJobChange(index, e)} />
            <span className="pdf-only">{job.description}</span>
            <input className="no-pdf" style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} name="price" placeholder="Prezzo" type="number" value={job.price} onChange={(e) => handleJobChange(index, e)} />
            <span className="pdf-only">{parseFloat(job.price).toFixed(2)} €</span>
            <input className="no-pdf" style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} name="vat" placeholder="Aliquota IVA" type="number" value={job.vat} onChange={(e) => handleJobChange(index, e)} />
            <span className="pdf-only">{job.vat}%</span>
          </div>
        ))}
      </section>
      <section style={{ backgroundColor: '#fff', padding: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', marginBottom: '1rem' }} ref={pdfRef}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', textAlign: 'center' }}>RIEPILOGO</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '1.125rem' }}>
          <div></div>
          <div style={{ textAlign: 'right', fontWeight: '600' }}>Subtotale: {summary.totalExclVAT.toFixed(2)} €</div>
          <div></div>
          <div style={{ textAlign: 'right', fontWeight: '600' }}>IVA: {summary.totalVAT.toFixed(2)} €</div>
          <div></div>
          <div style={{ fontWeight: 'bold', fontSize: '1.5rem', gridColumn: 'span 2', textAlign: 'right', marginTop: '1rem' }}>
            Totale: {summary.totalInclVAT.toFixed(2)} €
          </div>
        </div>
      </section>

      <div style={{ display: 'flex', gap: '1rem' }} className="no-pdf">
        <button className="button" onClick={generatePDF} disabled={loading}>
          {loading ? <div className="loading-spinner"></div> : 'Genera PDF'}
        </button>
      </div>
    </div>
  );
}

export default App;
