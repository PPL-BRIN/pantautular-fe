export interface TooltipData {
    id: string;
    location: string;
    summary: string;
    gender: string;
    age: string;
    alertLevel: string;
    relatedSearch: string;
    source: string;
  }
  
  export const getTooltipHTML = (data: TooltipData): string => {
    return `
      <style>
        .tooltip-container {
          background: white;
          padding: 10px;
          border-radius: 5px;
          color: black;
          font-family: Arial, sans-serif;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .tooltip-container h1 {
          text-align: center;
          color: #333;
          font-size: 16px;
          margin-bottom: 10px;
        }
        .detail-item {
          margin-bottom: 10px;
        }
        .label {
          font-weight: bold;
          color: #555;
        }
        .value {
          color: #333;
          margin-left: 10px;
        }
      </style>
      <div class="tooltip-container">
        <h1>Detail Kasus Penyakit Menular</h1>
        <div class="detail-item">
          <span class="label">ID Kasus:</span>
          <span class="value">${data.id}</span>
        </div>
        <div class="detail-item">
          <span class="label">Lokasi:</span>
          <span class="value">${data.location}</span>
        </div>
        <div class="detail-item">
          <span class="label">Ringkasan:</span>
          <span class="value">${data.summary}</span>
        </div>
        <div class="detail-item">
          <span class="label">Jenis Kelamin:</span>
          <span class="value">${data.gender}</span>
        </div>
        <div class="detail-item">
          <span class="label">Usia:</span>
          <span class="value">${data.age}</span>
        </div>
        <div class="detail-item">
          <span class="label">Tingkat Kewaspadaan:</span>
          <span class="value">${data.alertLevel}</span>
        </div>
        <div class="detail-item">
          <span class="label">Pencarian Terkait:</span>
          <span class="value">${data.relatedSearch}</span>
        </div>
        <div class="detail-item">
          <span class="label">Sumber:</span>
          <span class="value">${data.source}</span>
        </div>
      </div>
    `;
  };