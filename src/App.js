import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { Grid, TextField, Typography, Paper, Button, CircularProgress } from '@mui/material';

function App() {
  const initialClientInfo = {
    name: '',
    address: '',
    taxId: '',
    phone: '',
    email: ''
  };

  const initialVehicleInfo = {
    brand: '',
    model: '',
    licensePlate: ''
  };

  const initialJobs = [
    { description: '', price: 0, vat: 0 }
  ];

  const initialSummary = {
    totalExclVAT: 0,
    totalVAT: 0,
    totalInclVAT: 0
  };

  const [clientInfo, setClientInfo] = useState(initialClientInfo);
  const [vehicleInfo, setVehicleInfo] = useState(initialVehicleInfo);
  const [companyInfo] = useState({
    name: 'Saolotech di Saolo Domenico',
    address: 'C/DA Cipparello, 31 89034 Bovalino (RC)',
    taxId: '03285270801',
    phone: '333-3535809',
    email: 'domenico.saolo@gmail.com'
  });
  const [jobs, setJobs] = useState(initialJobs);
  const [summary, setSummary] = useState(initialSummary);
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
      setJobs([...newJobs, { description: '', price: 0, vat: 0 }]);
    }
  };

  const resetForm = () => {
    setClientInfo(initialClientInfo);
    setVehicleInfo(initialVehicleInfo);
    setJobs(initialJobs);
    setSummary(initialSummary);
    setQuoteNumber('');
  };

  const pdfRef = useRef();

  const generatePDF = (shouldPrint = false) => {
    setLoading(true);

    const jobsCopy = jobs.slice(0, jobs.length - 1);
    setJobs(jobsCopy);

    setTimeout(() => {
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
        const pdfWindow = window.open(pdfUrl, '_blank');

        noPdfElements.forEach(el => el.style.display = '');
        pdfOnlyElements.forEach(el => el.style.display = 'none');
        setLoading(false);
        setJobs([...jobsCopy, { description: '', price: 0, vat: 0 }]);

        const buttonsContainer = document.querySelector('.no-pdf');
        buttonsContainer.style.display = 'none';
        setTimeout(() => {
          buttonsContainer.style.display = 'flex';
        }, 0);

        if (shouldPrint) {
          pdfWindow.addEventListener('load', () => {
            pdfWindow.print();
          });
        }
      }).catch(() => {
        noPdfElements.forEach(el => el.style.display = '');
        pdfOnlyElements.forEach(el => el.style.display = 'none');
        setLoading(false);
        setJobs([...jobsCopy, { description: '', price: 0, vat: 0 }]);
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

          .pdf-only {
            display: none;
          }
        `}
      </style>
      <Paper elevation={3} style={{ padding: '1rem', marginBottom: '1rem' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1">PREVENTIVO</Typography>
          </Grid>
          <Grid item xs={12} md={6} container justifyContent="flex-end">
            <Grid item xs={12} sm="auto" container direction="column" alignItems="flex-end">
              <Grid item container spacing={1}>
                <Grid item xs={6}>
                  <Typography>Data:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>{new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}</Typography>
                </Grid>
              </Grid>
              <Grid item container spacing={1}>
                <Grid item xs={6}>
                  <Typography>N° preventivo:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="quoteNumber"
                    className="no-pdf"
                    variant="outlined"
                    size="small"
                    value={quoteNumber}
                    onChange={(e) => setQuoteNumber(e.target.value)}
                    style={{ width: '100px' }}
                  />
                  <Typography className="pdf-only">{quoteNumber}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} style={{ padding: '1rem', marginBottom: '1rem' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">AZIENDA</Typography>
            <Typography><strong>Nome:</strong> {companyInfo.name}</Typography>
            <Typography><strong>Indirizzo:</strong> {companyInfo.address}</Typography>
            <Typography><strong>P.IVA / C.F:</strong> {companyInfo.taxId}</Typography>
            <Typography><strong>Email:</strong> {companyInfo.email}</Typography>
            <Typography><strong>Telefono:</strong> {companyInfo.phone}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6">CLIENTE</Typography>
            {['name', 'address', 'taxId', 'email', 'phone'].map((field, index) => (
              <Grid container spacing={2} key={index} style={{ marginBottom: 16 }}>
                <Grid item xs={4} sm={3}>
                  <Typography className="no-pdf">
                    <strong>
                      {field === 'taxId' ? 'P.IVA / C.F.' : field === 'phone' ? 'Telefono' : field.charAt(0).toUpperCase() + field.slice(1)}:
                    </strong>
                  </Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <TextField
                    className="no-pdf"
                    fullWidth
                    variant="outlined"
                    size="small"
                    name={field}
                    placeholder={field === 'taxId' ? 'P.IVA / C.F.' : field === 'phone' ? 'Telefono' : field.charAt(0).toUpperCase() + field.slice(1)}
                    value={clientInfo[field]}
                    onChange={handleClientInfoChange}
                  />
                  <Typography className="pdf-only">
                    <strong>
                      {field === 'taxId' ? 'P.IVA / C.F.' : field === 'phone' ? 'Telefono' : field.charAt(0).toUpperCase() + field.slice(1)}:
                    </strong> {clientInfo[field]}
                  </Typography>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} style={{ padding: '1rem', marginBottom: '1rem' }}>
        <Typography variant="h6">DETTAGLI VEICOLO</Typography>
        <Grid container spacing={2}>
          {['brand', 'model', 'licensePlate'].map((field, index) => (
            <Grid item xs={12} md={4} key={index}>
              <TextField
                className="no-pdf"
                fullWidth
                variant="outlined"
                size="small"
                label={field === 'licensePlate' ? 'Targa' : field === 'brand' ? 'Marca' :  field=== 'model' ? 'Modello': field.charAt(0).toUpperCase() + field.slice(1)}
                name={field}
                value={vehicleInfo[field]}
                onChange={handleVehicleInfoChange}
              />
              <Typography className="pdf-only">
                <strong>{field === 'licensePlate' ? 'Targa' : field === 'brand' ? 'Marca' : field === 'model' ? 'Modello' : field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {vehicleInfo[field]}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>


      <Paper elevation={3} style={{ padding: '1rem', marginBottom: '1rem' }}>
        <Typography variant="h6">DESCRIZIONE DEI LAVORI</Typography>
        <Grid container spacing={2}>
          <Grid item xs={1}>
            <Typography fontWeight="bold">ID</Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography fontWeight="bold">DESCRIZIONE</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography fontWeight="bold">PREZZO</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography fontWeight="bold">ALIQUOTA IVA</Typography>
          </Grid>
        </Grid>
        {jobs.map((job, index) => (
          <Grid container spacing={2} key={index} style={{ marginBottom: '1rem' }}>
            <Grid item xs={1}>
              <Typography>{index + 1}</Typography>
            </Grid>
            <Grid item xs={5}>
              <TextField
                className="no-pdf"
                fullWidth
                variant="outlined"
                size="small"
                name="description"
                placeholder="Descrizione"
                value={job.description}
                onChange={(e) => handleJobChange(index, e)}
              />
              <Typography className="pdf-only">{job.description}</Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField
                className="no-pdf"
                fullWidth
                variant="outlined"
                size="small"
                name="price"
                placeholder="Prezzo"
                type="number"
                value={job.price}
                onChange={(e) => handleJobChange(index, e)}
              />
              <Typography className="pdf-only">{parseFloat(job.price).toFixed(2)} €</Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField
                className="no-pdf"
                fullWidth
                variant="outlined"
                size="small"
                name="vat"
                placeholder="Aliquota IVA"
                type="number"
                value={job.vat}
                onChange={(e) => handleJobChange(index, e)}
              />
              <Typography className="pdf-only">{job.vat}%</Typography>
            </Grid>
          </Grid>
        ))}
      </Paper>

      <Paper elevation={3} style={{ padding: '1rem', marginBottom: '1rem' }}>
        <Typography variant="h6" align="center">RIEPILOGO</Typography>
        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item xs={12} md={6}>
            <Grid container justifyContent="space-between">
              <Grid item>
                <Typography fontWeight="bold">Subtotale:</Typography>
              </Grid>
              <Grid item>
                <Typography fontWeight="bold">{summary.totalExclVAT.toFixed(2)} €</Typography>
              </Grid>
            </Grid>
            <Grid container justifyContent="space-between">
              <Grid item>
                <Typography fontWeight="bold">IVA:</Typography>
              </Grid>
              <Grid item>
                <Typography fontWeight="bold">{summary.totalVAT.toFixed(2)} €</Typography>
              </Grid>
            </Grid>
            <Grid container justifyContent="space-between" style={{ marginTop: '1rem' }}>
              <Grid item>
                <Typography fontWeight="bold" fontSize="1.5rem">Totale:</Typography>
              </Grid>
              <Grid item>
                <Typography fontWeight="bold" fontSize="1.5rem">{summary.totalInclVAT.toFixed(2)} €</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2} justifyContent="center" className='no-pdf'>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => generatePDF(false)}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Genera PDF'}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={generatePDF}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Stampa PDF'}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={resetForm}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Reset'}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
