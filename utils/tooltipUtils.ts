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
    <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif; color: #333; max-width: 300px;">
      <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #2c3e50;">Detail Kasus Penyakit Menular</div>
      
      <!-- ID Kasus -->
      <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span style="font-weight: bold; color: #555;">ID Kasus:</span>
        <span style="color: #333; text-align: right;">${data.id}</span>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 8px 0;">
      
      <!-- Lokasi -->
      <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span style="font-weight: bold; color: #555;">Lokasi:</span>
        <span style="color: #333; text-align: right;">${data.location}</span>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 8px 0;">
      
      <!-- Ringkasan -->
      <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span style="font-weight: bold; color: #555;">Ringkasan:</span>
        <span style="color: #333; text-align: right;">${data.summary}</span>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 8px 0;">
      
      <!-- Jenis Kelamin -->
      <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span style="font-weight: bold; color: #555;">Jenis Kelamin:</span>
        <span style="color: #333; text-align: right;">${data.gender}</span>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 8px 0;">
      
      <!-- Usia -->
      <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span style="font-weight: bold; color: #555;">Usia:</span>
        <span style="color: #333; text-align: right;">${data.age}</span>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 8px 0;">
      
      <!-- Tingkat Kewaspadaan -->
      <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span style="font-weight: bold; color: #e74c3c;">Tingkat Kewaspadaan:</span>
        <span style="color: #333; text-align: right;">${data.alertLevel}</span>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 8px 0;">
      
      <!-- Pencarian Terkait -->
      <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span style="font-weight: bold; color: #555;">Pencarian Terkait:</span>
        <span style="color: #333; text-align: right;">${data.relatedSearch}</span>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 8px 0;">
      
      <!-- Sumber -->
      <div style="font-size: 12px; color: #777; margin-top: 10px;">${data.source}</div>
    </div>
  `;
};