import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  // const handleSubmit = async () => {
  //   const data = { clientInfo, vehicleInfo, jobs, summary };
  //   await fetch('/api/save-quote', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify(data)
  //   });
  // };

  const pdfRef = useRef();
  const summaryRef = useRef();

  const generatePDF = () => {
    setLoading(true);

    const jobsCopy = jobs.slice(0, jobs.length - 1);

    setJobs(jobsCopy);

    setTimeout(() => {
      const input = pdfRef.current;
      const summaryElement = summaryRef.current;

      html2canvas(input, { scale: 2 }).then(canvas => {
        const summaryRect = summaryElement.getBoundingClientRect();
        const inputRect = input.getBoundingClientRect();

        const canvasHeight = summaryRect.bottom - inputRect.top;

        const croppedCanvas = document.createElement('canvas');
        const croppedContext = croppedCanvas.getContext('2d');
        croppedCanvas.width = canvas.width;
        croppedCanvas.height = canvasHeight * (canvas.height / inputRect.height);

        croppedContext.drawImage(canvas, 0, 0, canvas.width, croppedCanvas.height, 0, 0, canvas.width, croppedCanvas.height);

        const imgData = croppedCanvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`preventivo_${vehicleInfo.brand}_${vehicleInfo.model}_${vehicleInfo.licensePlate}.pdf`);
        setLoading(false);

        setJobs([...jobsCopy, { description: '', price: '', vat: 0 }]);
      }).catch(() => {
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
            <label htmlFor="quoteNumber" style={{ margin: 0 }}>N° preventivo:</label>
            <input id="quoteNumber" style={{ padding: '0.25rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem', width: '100px' }} value={quoteNumber} onChange={(e) => setQuoteNumber(e.target.value)} />
          </div>
        </div>
      </header>

      <section style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#fff', padding: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ width: '48%' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>AZIENDA</h2>
          <p><strong>Nome:</strong> {companyInfo.name}</p>
          <p><strong>Indirizzo:</strong> {companyInfo.address}</p>
          <p><strong>P.IVA / C.F:</strong> {companyInfo.taxId}</p>
          <p><strong>Email:</strong> {companyInfo.email}</p>
          <p><strong>Telefono:</strong> {companyInfo.phone}</p>
        </div>
        <div style={{ width: '1px', backgroundColor: '#e2e8f0' }}></div>
        <div style={{ width: '48%' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>CLIENTE</h2>
          <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
            <label style={{ width: '30%' }}><strong>Nome:</strong></label>
            <input style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} name="name" placeholder="Nome" value={clientInfo.name} onChange={handleClientInfoChange} />
          </div>
          <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
            <label style={{ width: '30%' }}><strong>Indirizzo:</strong></label>
            <input style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} name="address" placeholder="Indirizzo" value={clientInfo.address} onChange={handleClientInfoChange} />
          </div>
          <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
            <label style={{ width: '30%' }}><strong>P.IVA / C.F:</strong></label>
            <input style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} name="taxId" placeholder="P.IVA / C.F" value={clientInfo.taxId} onChange={handleClientInfoChange} />
          </div>
          <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
            <label style={{ width: '30%' }}><strong>Email:</strong></label>
            <input style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} name="email" placeholder="Email" value={clientInfo.email} onChange={handleClientInfoChange} />
          </div>
          <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
            <label style={{ width: '30%' }}><strong>Telefono:</strong></label>
            <input style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} name="phone" placeholder="Telefono" value={clientInfo.phone} onChange={handleClientInfoChange} />
          </div>
        </div>
      </section>
      <section style={{ backgroundColor: '#fff', padding: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>DETTAGLI VEICOLO</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
          <div className="input-group">
            <label htmlFor="brand">Marca Auto:</label>
            <input id="brand" name="brand" placeholder="Marca Auto" value={vehicleInfo.brand} onChange={handleVehicleInfoChange} />
          </div>
          <div className="input-group">
            <label htmlFor="model">Modello Auto:</label>
            <input id="model" name="model" placeholder="Modello Auto" value={vehicleInfo.model} onChange={handleVehicleInfoChange} />
          </div>
          <div className="input-group">
            <label htmlFor="licensePlate">Targa Auto:</label>
            <input id="licensePlate" name="licensePlate" placeholder="Targa Auto" value={vehicleInfo.licensePlate} onChange={handleVehicleInfoChange} />
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
            <input style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} name="description" placeholder="Descrizione" value={job.description} onChange={(e) => handleJobChange(index, e)} />
            <input style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} name="price" placeholder="Prezzo" type="number" value={job.price} onChange={(e) => handleJobChange(index, e)} />
            <input style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }} name="vat" placeholder="Aliquota IVA" type="number" value={job.vat} onChange={(e) => handleJobChange(index, e)} />
          </div>
        ))}
      </section>
      <section style={{ backgroundColor: '#fff', padding: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', marginBottom: '1rem' }} ref={summaryRef}>
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

      <div style={{ display: 'flex', gap: '1rem' }}>
        {/* <button className="button" onClick={handleSubmit}>Salva</button> */}
        <button className="button" onClick={generatePDF} disabled={loading}>
          {loading ? <div className="loading-spinner"></div> : 'Genera PDF'}
        </button>
      </div>
    </div>
  );
}

export default App;
