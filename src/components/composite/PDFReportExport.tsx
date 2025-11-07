import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Ply, Material } from '@/types/materials';
import { ABDMatrix } from '@/utils/abdMatrix';
import { toast } from 'sonner';

interface PDFReportExportProps {
  plies: Ply[];
  materials: Record<string, Material>;
  abdMatrix: ABDMatrix;
  engineeringProps: any;
  stressResults: any[];
  failureResults: any[];
  loadCase?: {
    name: string;
    loads: { Nx: number; Ny: number; Nxy: number; Mx: number; My: number; Mxy: number };
  };
  geometryType?: 'plate' | 'tube';
  thermalResults?: any[];
  bucklingResult?: any;
  progressiveFailureAnalysis?: any;
  interlaminarResults?: any[];
}

export function PDFReportExport({
  plies,
  materials,
  abdMatrix,
  engineeringProps,
  stressResults,
  failureResults,
  loadCase,
  geometryType = 'plate',
  thermalResults = [],
  bucklingResult = null,
  progressiveFailureAnalysis = null,
  interlaminarResults = []
}: PDFReportExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      let yPos = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;

      // Helper function to check if we need a new page
      const checkNewPage = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
          return true;
        }
        return false;
      };

      // Add page numbers footer
      const addPageNumbers = () => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(128);
          doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      };

      // ============ COVER PAGE ============
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, pageWidth, 80, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPOSITE LAMINATE', pageWidth / 2, 35, { align: 'center' });
      doc.text('ANALYSIS REPORT', pageWidth / 2, 50, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Structural Engineering Analysis', pageWidth / 2, 65, { align: 'center' });

      // Report metadata box
      yPos = 100;
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(margin, yPos, contentWidth, 60, 3, 3, 'F');
      
      yPos += 15;
      doc.setFontSize(11);
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, margin + 10, yPos);
      yPos += 10;
      doc.text(`Configuration: ${plies.length} ply laminate`, margin + 10, yPos);
      yPos += 10;
      doc.text(`Total Thickness: ${engineeringProps.thickness.toFixed(3)} mm`, margin + 10, yPos);
      yPos += 10;
      doc.text(`Analysis Type: ${geometryType === 'tube' ? 'Cylindrical Shell Theory' : 'Classical Lamination Theory (CLT)'}`, margin + 10, yPos);
      yPos += 10;
      if (loadCase) {
        doc.text(`Load Case: ${loadCase.name}`, margin + 10, yPos);
      }

      // Summary box
      yPos += 30;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const summaryText = `This report presents a comprehensive structural analysis of a ${plies.length}-ply composite laminate using Classical Lamination Theory. The analysis includes stiffness characterization through the ABD matrix, engineering property calculations, stress and strain distributions under applied loads, and failure analysis using multiple failure criteria.`;
      const splitSummary = doc.splitTextToSize(summaryText, contentWidth - 20);
      doc.text(splitSummary, margin + 10, yPos);

      // ============ TABLE OF CONTENTS ============
      doc.addPage();
      yPos = 20;
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Table of Contents', margin, yPos);
      yPos += 15;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const tocItems = [
        '1. Laminate Configuration',
        '2. Material Properties',
        '3. Ply Stack Sequence',
        '4. ABD Stiffness Matrices',
        '5. Engineering Properties',
        '6. Load Case Definition',
        '7. Stress Analysis Results',
        '8. Strain Analysis Results',
        '9. Failure Analysis',
        '10. Advanced Analyses',
        '11. Safety Margins & Conclusions'
      ];
      tocItems.forEach(item => {
        doc.text(item, margin + 10, yPos);
        yPos += 8;
      });

      // ============ SECTION 1: CONFIGURATION ============
      doc.addPage();
      yPos = 20;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('1. Laminate Configuration', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 12;

      const configData = [
        ['Parameter', 'Value', 'Unit'],
        ['Number of Plies', plies.length.toString(), '-'],
        ['Total Thickness', engineeringProps.thickness.toFixed(3), 'mm'],
        ['Stacking Sequence', plies.map(p => `${p.angle}°`).join('/'), '°'],
        ['Analysis Method', 'Classical Lamination Theory', '-'],
        ['Coordinate System', 'Global (x-y) and Material (1-2)', '-']
      ];

      autoTable(doc, {
        startY: yPos,
        head: [configData[0]],
        body: configData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], fontSize: 10 },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // ============ SECTION 2: MATERIAL PROPERTIES ============
      checkNewPage(80);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('2. Material Properties', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 12;

      // Get unique materials
      const uniqueMaterials = Array.from(new Set(plies.map(p => p.material)));
      uniqueMaterials.forEach((matName, idx) => {
        const mat = materials[matName];
        if (!mat) return;

        if (idx > 0) yPos += 10;
        checkNewPage(60);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Material ${idx + 1}: ${mat.name}`, margin, yPos);
        yPos += 8;

        const matData = [
          ['Property', 'Value', 'Unit'],
          ['Longitudinal Modulus (E₁)', mat.E1.toFixed(0), 'MPa'],
          ['Transverse Modulus (E₂)', mat.E2.toFixed(0), 'MPa'],
          ['Shear Modulus (G₁₂)', mat.G12.toFixed(0), 'MPa'],
          ['Poisson Ratio (ν₁₂)', mat.nu12.toFixed(3), '-'],
          ['Ply Thickness', mat.thickness.toFixed(3), 'mm'],
          ['Density', mat.density.toFixed(2), 'g/cm³'],
          ...(mat.tensile_strength ? [['Tensile Strength', mat.tensile_strength.toFixed(0), 'MPa']] : []),
          ...(mat.compressive_strength ? [['Compressive Strength', mat.compressive_strength.toFixed(0), 'MPa']] : []),
          ...(mat.shear_strength ? [['Shear Strength', mat.shear_strength.toFixed(0), 'MPa']] : []),
          ['Thermal Resistance', mat.thermal_resistance.toFixed(0), '°C']
        ];

        autoTable(doc, {
          startY: yPos,
          head: [matData[0]],
          body: matData.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [52, 152, 219], fontSize: 9 },
          styles: { fontSize: 8 },
          margin: { left: margin + 5, right: margin }
        });

        yPos = (doc as any).lastAutoTable.finalY + 5;
      });

      // ============ SECTION 3: PLY STACK ============
      doc.addPage();
      yPos = 20;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('3. Ply Stack Sequence', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 12;

      const plyData = [
        ['Ply #', 'Material', 'Angle (°)', 'Thickness (mm)', 'Position (mm)']
      ];

      let zPos = -engineeringProps.thickness / 2;
      plies.forEach((ply, idx) => {
        const mat = materials[ply.material];
        if (!mat) return;
        const zStart = zPos;
        const zEnd = zPos + mat.thickness;
        plyData.push([
          (idx + 1).toString(),
          mat.name,
          ply.angle.toString(),
          mat.thickness.toFixed(3),
          `${zStart.toFixed(3)} to ${zEnd.toFixed(3)}`
        ]);
        zPos = zEnd;
      });

      autoTable(doc, {
        startY: yPos,
        head: [plyData[0]],
        body: plyData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], fontSize: 9 },
        styles: { fontSize: 8, halign: 'center' },
        margin: { left: margin, right: margin }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Add stacking notation
      checkNewPage(30);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Stacking Notation:', margin, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const stackingNotation = `[${plies.map(p => p.angle).join('/')}]`;
      doc.text(stackingNotation, margin + 5, yPos);

      // ============ SECTION 4: ABD MATRICES ============
      doc.addPage();
      yPos = 20;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('4. ABD Stiffness Matrices', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 12;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const abdDescription = 'The ABD matrix relates forces and moments to strains and curvatures in the laminate. A: extensional stiffness, B: coupling stiffness, D: bending stiffness.';
      doc.text(doc.splitTextToSize(abdDescription, contentWidth), margin, yPos);
      yPos += 20;

      const formatMatrixValue = (val: number) => {
        if (Math.abs(val) < 0.001) return '0.00';
        if (Math.abs(val) >= 1e6) return val.toExponential(2);
        if (Math.abs(val) >= 1000) return val.toFixed(0);
        return val.toFixed(2);
      };

      // A Matrix
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('A Matrix (Extensional Stiffness) [N/mm]', margin, yPos);
      yPos += 8;

      const aData = abdMatrix.A.map((row, i) => 
        [`A${i+1}j`, ...row.map(formatMatrixValue)]
      );
      aData.unshift(['', 'j=1', 'j=2', 'j=3']);

      autoTable(doc, {
        startY: yPos,
        head: [aData[0]],
        body: aData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219], fontSize: 9 },
        styles: { fontSize: 8, halign: 'right', font: 'courier' },
        margin: { left: margin, right: margin }
      });

      yPos = (doc as any).lastAutoTable.finalY + 12;
      checkNewPage(60);

      // B Matrix
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('B Matrix (Coupling Stiffness) [N]', margin, yPos);
      yPos += 8;

      const bData = abdMatrix.B.map((row, i) => 
        [`B${i+1}j`, ...row.map(formatMatrixValue)]
      );
      bData.unshift(['', 'j=1', 'j=2', 'j=3']);

      autoTable(doc, {
        startY: yPos,
        head: [bData[0]],
        body: bData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219], fontSize: 9 },
        styles: { fontSize: 8, halign: 'right', font: 'courier' },
        margin: { left: margin, right: margin }
      });

      yPos = (doc as any).lastAutoTable.finalY + 12;
      checkNewPage(60);

      // D Matrix
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('D Matrix (Bending Stiffness) [N·mm]', margin, yPos);
      yPos += 8;

      const dData = abdMatrix.D.map((row, i) => 
        [`D${i+1}j`, ...row.map(formatMatrixValue)]
      );
      dData.unshift(['', 'j=1', 'j=2', 'j=3']);

      autoTable(doc, {
        startY: yPos,
        head: [dData[0]],
        body: dData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219], fontSize: 9 },
        styles: { fontSize: 8, halign: 'right', font: 'courier' },
        margin: { left: margin, right: margin }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // ============ SECTION 5: ENGINEERING PROPERTIES ============
      checkNewPage(80);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('5. Equivalent Engineering Properties', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 12;

      const engPropData = [
        ['Property', 'Symbol', 'Value', 'Unit'],
        ['Longitudinal Modulus', 'Eₓ', engineeringProps.Ex.toFixed(2), 'MPa'],
        ['Transverse Modulus', 'Eᵧ', engineeringProps.Ey.toFixed(2), 'MPa'],
        ['Shear Modulus', 'Gₓᵧ', engineeringProps.Gxy.toFixed(2), 'MPa'],
        ['Major Poisson Ratio', 'νₓᵧ', engineeringProps.nuxy.toFixed(4), '-'],
        ['Total Thickness', 'h', engineeringProps.thickness.toFixed(3), 'mm']
      ];

      autoTable(doc, {
        startY: yPos,
        head: [engPropData[0]],
        body: engPropData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], fontSize: 10 },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // ============ SECTION 6: LOAD CASE ============
      if (loadCase) {
        checkNewPage(60);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text('6. Load Case Definition', margin, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 12;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Load Case: ${loadCase.name}`, margin, yPos);
        yPos += 10;

        const loadData = [
          ['Load Component', 'Symbol', 'Value', 'Unit'],
          ['Axial Force', 'Nₓ', loadCase.loads.Nx.toFixed(2), 'N/mm'],
          ['Transverse Force', 'Nᵧ', loadCase.loads.Ny.toFixed(2), 'N/mm'],
          ['In-plane Shear', 'Nₓᵧ', loadCase.loads.Nxy.toFixed(2), 'N/mm'],
          ['Bending Moment X', 'Mₓ', loadCase.loads.Mx.toFixed(2), 'N'],
          ['Bending Moment Y', 'Mᵧ', loadCase.loads.My.toFixed(2), 'N'],
          ['Twisting Moment', 'Mₓᵧ', loadCase.loads.Mxy.toFixed(2), 'N']
        ];

        autoTable(doc, {
          startY: yPos,
          head: [loadData[0]],
          body: loadData.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185], fontSize: 10 },
          styles: { fontSize: 9 },
          margin: { left: margin, right: margin }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // ============ SECTION 7: STRESS RESULTS ============
      if (stressResults && stressResults.length > 0) {
        doc.addPage();
        yPos = 20;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text('7. Stress Analysis Results', margin, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 12;

        // Material Coordinate Stresses
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Material Coordinate Stresses', margin, yPos);
        yPos += 8;

        const matStressData = [
          ['Ply', 'Material', 'Angle (°)', 'σ₁ (MPa)', 'σ₂ (MPa)', 'τ₁₂ (MPa)', 'von Mises (MPa)']
        ];

        stressResults.forEach((result) => {
          matStressData.push([
            (result.ply || 0).toString(),
            result.material || 'N/A',
            (result.angle || 0).toString(),
            (result.sigma_1 || 0).toFixed(2),
            (result.sigma_2 || 0).toFixed(2),
            (result.tau_12 || 0).toFixed(2),
            (result.von_mises || 0).toFixed(2)
          ]);
        });

        autoTable(doc, {
          startY: yPos,
          head: [matStressData[0]],
          body: matStressData.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185], fontSize: 8 },
          styles: { fontSize: 7, halign: 'center' },
          margin: { left: margin, right: margin }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;

        // Global Coordinate Stresses
        checkNewPage(80);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Global Coordinate Stresses', margin, yPos);
        yPos += 8;

        const globalStressData = [
          ['Ply', 'σₓ (MPa)', 'σᵧ (MPa)', 'τₓᵧ (MPa)', 'σ_max (MPa)', 'σ_min (MPa)', 'τ_max (MPa)']
        ];

        stressResults.forEach((result) => {
          globalStressData.push([
            (result.ply || 0).toString(),
            (result.sigma_x || 0).toFixed(2),
            (result.sigma_y || 0).toFixed(2),
            (result.tau_xy || 0).toFixed(2),
            (result.sigma_principal_max || 0).toFixed(2),
            (result.sigma_principal_min || 0).toFixed(2),
            (result.tau_max || 0).toFixed(2)
          ]);
        });

        autoTable(doc, {
          startY: yPos,
          head: [globalStressData[0]],
          body: globalStressData.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185], fontSize: 8 },
          styles: { fontSize: 7, halign: 'center' },
          margin: { left: margin, right: margin }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;

        // ============ SECTION 8: STRAIN RESULTS ============
        checkNewPage(60);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text('8. Strain Analysis Results', margin, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 12;

        const strainData = [
          ['Ply', 'Material', 'ε₁', 'ε₂', 'γ₁₂']
        ];

        stressResults.forEach((result) => {
          strainData.push([
            (result.ply || 0).toString(),
            result.material || 'N/A',
            (result.epsilon_1 || 0).toExponential(3),
            (result.epsilon_2 || 0).toExponential(3),
            (result.gamma_12 || 0).toExponential(3)
          ]);
        });

        autoTable(doc, {
          startY: yPos,
          head: [strainData[0]],
          body: strainData.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [41, 128, 185], fontSize: 9 },
          styles: { fontSize: 8, halign: 'center', font: 'courier' },
          margin: { left: margin, right: margin }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // ============ SECTION 9: FAILURE ANALYSIS ============
      if (failureResults && failureResults.length > 0) {
        doc.addPage();
        yPos = 20;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text('9. Failure Analysis', margin, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 12;

        const failureData = [
          ['Ply', 'Material', 'Max Stress', 'Tsai-Wu', 'Tsai-Hill', 'Status']
        ];

        failureResults.forEach((result) => {
          const status = result.failed ? '⚠ FAILED' : '✓ PASS';
          failureData.push([
            (result.ply || 0).toString(),
            result.material || 'N/A',
            (result.maxStressFI || 0).toFixed(3),
            (result.tsaiWuFI || 0).toFixed(3),
            (result.tsaiHillFI || 0).toFixed(3),
            status
          ]);
        });

        autoTable(doc, {
          startY: yPos,
          head: [failureData[0]],
          body: failureData.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185], fontSize: 9 },
          styles: { fontSize: 8, halign: 'center' },
          didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
              const value = data.cell.text[0];
              if (value.includes('FAILED')) {
                data.cell.styles.textColor = [231, 76, 60];
                data.cell.styles.fontStyle = 'bold';
              } else if (value.includes('PASS')) {
                data.cell.styles.textColor = [39, 174, 96];
                data.cell.styles.fontStyle = 'bold';
              }
            }
          },
          margin: { left: margin, right: margin }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;

        // Add failure criterion note
        checkNewPage(30);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text('Note: Failure Index (FI) > 1.0 indicates failure. Values shown are based on applied safety factors.', margin, yPos);
        yPos += 15;
      }

      // ============ SECTION 10: ADVANCED ANALYSES ============
      doc.addPage();
      yPos = 20;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('10. Advanced Analyses', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 12;

      // Thermal Stress Analysis
      if (thermalResults && thermalResults.length > 0) {
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('10.1 Thermal Stress Analysis', margin, yPos);
        yPos += 10;

        const thermalData = [
          ['Ply', 'Material', 'σ₁ Thermal (MPa)', 'σ₂ Thermal (MPa)', 'τ₁₂ Thermal (MPa)']
        ];

        thermalResults.forEach((result: any) => {
          thermalData.push([
            result.ply.toString(),
            result.material,
            result.sigma_1_thermal.toFixed(2),
            result.sigma_2_thermal.toFixed(2),
            result.tau_12_thermal.toFixed(2)
          ]);
        });

        autoTable(doc, {
          startY: yPos,
          head: [thermalData[0]],
          body: thermalData.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [52, 152, 219], fontSize: 9 },
          styles: { fontSize: 8, halign: 'center' },
          margin: { left: margin, right: margin }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Buckling Analysis
      if (bucklingResult && bucklingResult.buckling_factor) {
        checkNewPage(50);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('10.2 Buckling Analysis', margin, yPos);
        yPos += 10;

        const bucklingData = [
          ['Parameter', 'Value', 'Unit'],
          ['Buckling Mode', bucklingResult.buckling_mode, '-'],
          ['Buckling Factor', bucklingResult.buckling_factor.toFixed(2), '-'],
          ...(bucklingResult.critical_load_Nx ? [['Critical Nx', bucklingResult.critical_load_Nx.toFixed(2), 'N/mm']] : []),
          ...(bucklingResult.critical_load_Ny ? [['Critical Ny', bucklingResult.critical_load_Ny.toFixed(2), 'N/mm']] : []),
          ...(bucklingResult.critical_load_Nxy ? [['Critical Nxy', bucklingResult.critical_load_Nxy.toFixed(2), 'N/mm']] : []),
          ['Buckling Risk', bucklingResult.is_buckling_concern ? 'HIGH' : 'Low', '-']
        ];

        autoTable(doc, {
          startY: yPos,
          head: [bucklingData[0]],
          body: bucklingData.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [52, 152, 219], fontSize: 9 },
          styles: { fontSize: 8 },
          margin: { left: margin, right: margin }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Progressive Failure Analysis
      if (progressiveFailureAnalysis && progressiveFailureAnalysis.steps) {
        checkNewPage(60);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('10.3 Progressive Failure Analysis', margin, yPos);
        yPos += 10;

        const progData = [
          ['Parameter', 'Value'],
          ...(progressiveFailureAnalysis.firstPlyFailure ? [
            ['First Ply Failure', `Ply ${progressiveFailureAnalysis.firstPlyFailure.ply} at iteration ${progressiveFailureAnalysis.firstPlyFailure.iteration}`]
          ] : []),
          ...(progressiveFailureAnalysis.lastPlyFailure ? [
            ['Last Ply Failure', `Ply ${progressiveFailureAnalysis.lastPlyFailure.ply} at iteration ${progressiveFailureAnalysis.lastPlyFailure.iteration}`]
          ] : []),
          ['Ultimate Strength Factor', `${progressiveFailureAnalysis.ultimateStrength.toFixed(2)}×`],
          ['Total Iterations', progressiveFailureAnalysis.steps.length.toString()],
          ['Final Failed Plies', progressiveFailureAnalysis.steps[progressiveFailureAnalysis.steps.length - 1].failedPlies.length.toString()]
        ];

        autoTable(doc, {
          startY: yPos,
          head: [progData[0]],
          body: progData.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [52, 152, 219], fontSize: 9 },
          styles: { fontSize: 8 },
          margin: { left: margin, right: margin }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Interlaminar Stress Analysis
      if (interlaminarResults && interlaminarResults.length > 0) {
        checkNewPage(60);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('10.4 Interlaminar Stress Analysis', margin, yPos);
        yPos += 10;

        const interlamData = [
          ['Interface', 'z (mm)', 'σz (MPa)', 'τxz (MPa)', 'τyz (MPa)', 'Risk']
        ];

        interlaminarResults.forEach((result: any) => {
          interlamData.push([
            result.interface_number.toString(),
            result.z.toFixed(3),
            result.sigma_z.toFixed(2),
            result.tau_xz.toFixed(2),
            result.tau_yz.toFixed(2),
            result.delamination_risk
          ]);
        });

        autoTable(doc, {
          startY: yPos,
          head: [interlamData[0]],
          body: interlamData.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [52, 152, 219], fontSize: 8 },
          styles: { fontSize: 7, halign: 'center' },
          didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
              const value = data.cell.text[0];
              if (value === 'High') {
                data.cell.styles.textColor = [231, 76, 60];
                data.cell.styles.fontStyle = 'bold';
              } else if (value === 'Medium') {
                data.cell.styles.textColor = [243, 156, 18];
              } else {
                data.cell.styles.textColor = [39, 174, 96];
              }
            }
          },
          margin: { left: margin, right: margin }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // ============ SECTION 11: CONCLUSIONS ============
      doc.addPage();
      yPos = 20;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('11. Safety Margins & Conclusions', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 15;

      // ============ FINAL PAGE: REFERENCES & NOTES ============
      doc.addPage();
      yPos = 20;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('References & Analysis Notes', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 15;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Analysis Methodology:', margin, yPos);
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      const methodText = [
        `• ${geometryType === 'tube' ? 'Cylindrical Shell Theory with curvature corrections' : 'Classical Lamination Theory (CLT)'} was used for all calculations`,
        '• Plane stress assumption applied to each ply',
        '• Perfect bonding assumed between plies',
        '• Linear elastic material behavior',
        '• Small deformation theory',
        ...(thermalResults && thermalResults.length > 0 ? ['• Thermal stress analysis included'] : []),
        ...(bucklingResult ? ['• Buckling analysis performed'] : []),
        ...(progressiveFailureAnalysis ? ['• Progressive failure analysis with ply degradation'] : []),
        ...(interlaminarResults && interlaminarResults.length > 0 ? ['• Interlaminar stress and delamination analysis'] : [])
      ];
      methodText.forEach(text => {
        doc.text(text, margin + 5, yPos);
        yPos += 7;
      });

      yPos += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('References:', margin, yPos);
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      const references = [
        '1. NASA RP-1351: Basic Mechanics of Laminated Composite Plates',
        '2. Jones, R.M. "Mechanics of Composite Materials", 2nd Ed., Taylor & Francis, 1999',
        '3. Herakovich, C.T. "Mechanics of Fibrous Composites", Wiley, 1998',
        '4. Tsai, S.W. and Wu, E.M. "A General Theory of Strength for Anisotropic Materials"',
        '5. ASTM D3039: Standard Test Method for Tensile Properties of Composites'
      ];
      references.forEach(ref => {
        doc.text(ref, margin + 5, yPos);
        yPos += 6;
      });

      yPos += 15;
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margin, yPos, contentWidth, 40, 2, 2, 'F');
      yPos += 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Disclaimer: This analysis is provided for engineering evaluation purposes. Results should be', margin + 10, yPos);
      yPos += 5;
      doc.text('validated against experimental data and design codes before use in critical applications.', margin + 10, yPos);
      yPos += 5;
      doc.text('The accuracy of results depends on the quality of input material properties and load definitions.', margin + 10, yPos);

      // Add page numbers
      addPageNumbers();

      // Save the PDF
      const filename = `Composite_Analysis_${new Date().getTime()}.pdf`;
      doc.save(filename);
      toast.success('Comprehensive PDF report generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating || plies.length === 0}
      variant="default"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4 mr-2" />
          Export PDF Report
        </>
      )}
    </Button>
  );
}
