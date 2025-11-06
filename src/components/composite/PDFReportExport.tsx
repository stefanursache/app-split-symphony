import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import jsPDF from 'jspdf';
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
    loads: { axial: number; bending: number; torsion: number };
  };
}

export function PDFReportExport({
  plies,
  materials,
  abdMatrix,
  engineeringProps,
  stressResults,
  failureResults,
  loadCase
}: PDFReportExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      let yPos = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Composite Laminate Analysis Report', margin, yPos);
      yPos += 15;

      // Date and time
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos);
      yPos += 15;

      // Configuration Summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Laminate Configuration', margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Number of plies: ${plies.length}`, margin, yPos);
      yPos += 6;
      doc.text(`Total thickness: ${engineeringProps.thickness.toFixed(3)} mm`, margin, yPos);
      yPos += 10;

      // Ply stack table
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Ply Stack', margin, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // Table header
      const colWidths = [15, 60, 25, 35];
      const startX = margin;
      doc.setFont('helvetica', 'bold');
      doc.text('#', startX, yPos);
      doc.text('Material', startX + colWidths[0], yPos);
      doc.text('Angle (°)', startX + colWidths[0] + colWidths[1], yPos);
      doc.text('Thickness (mm)', startX + colWidths[0] + colWidths[1] + colWidths[2], yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      plies.forEach((ply, idx) => {
        const material = materials[ply.material];
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${idx + 1}`, startX, yPos);
        doc.text(ply.material, startX + colWidths[0], yPos);
        doc.text(ply.angle.toString(), startX + colWidths[0] + colWidths[1], yPos);
        doc.text(material?.thickness.toFixed(3) || 'N/A', startX + colWidths[0] + colWidths[1] + colWidths[2], yPos);
        yPos += 5;
      });

      yPos += 10;

      // ABD Matrix
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('ABD Matrix', margin, yPos);
      yPos += 10;

      const formatMatrix = (mat: number[][]) => {
        return mat.map(row => 
          row.map(val => {
            if (Math.abs(val) < 0.001) return '0.00';
            if (Math.abs(val) >= 1000000) return val.toExponential(2);
            return val.toFixed(2);
          })
        );
      };

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // A Matrix
      doc.text('A Matrix (N/mm):', margin, yPos);
      yPos += 6;
      formatMatrix(abdMatrix.A).forEach(row => {
        doc.text(row.join('  '), margin + 5, yPos);
        yPos += 5;
      });
      yPos += 5;

      // B Matrix
      doc.text('B Matrix (N):', margin, yPos);
      yPos += 6;
      formatMatrix(abdMatrix.B).forEach(row => {
        doc.text(row.join('  '), margin + 5, yPos);
        yPos += 5;
      });
      yPos += 5;

      // D Matrix
      doc.text('D Matrix (N·mm):', margin, yPos);
      yPos += 6;
      formatMatrix(abdMatrix.D).forEach(row => {
        doc.text(row.join('  '), margin + 5, yPos);
        yPos += 5;
      });

      // Engineering Properties
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 10;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Engineering Properties', margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Ex: ${engineeringProps.Ex.toFixed(2)} MPa`, margin, yPos);
      yPos += 6;
      doc.text(`Ey: ${engineeringProps.Ey.toFixed(2)} MPa`, margin, yPos);
      yPos += 6;
      doc.text(`Gxy: ${engineeringProps.Gxy.toFixed(2)} MPa`, margin, yPos);
      yPos += 6;
      doc.text(`νxy: ${engineeringProps.nuxy.toFixed(4)}`, margin, yPos);
      yPos += 10;

      // Load Case Information
      if (loadCase) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Load Case: ' + loadCase.name, margin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Axial Force: ${loadCase.loads.axial} N`, margin, yPos);
        yPos += 6;
        doc.text(`Bending Moment: ${loadCase.loads.bending} N·mm`, margin, yPos);
        yPos += 6;
        doc.text(`Torsion: ${loadCase.loads.torsion} N·mm`, margin, yPos);
        yPos += 10;
      }

      // Stress Results
      if (stressResults.length > 0) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Stress Analysis Results', margin, yPos);
        yPos += 10;

        doc.setFontSize(9);
        stressResults.forEach((result, idx) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`Ply ${idx + 1}:`, margin, yPos);
          yPos += 5;
          doc.setFont('helvetica', 'normal');
          doc.text(`  σ₁: ${result.sigma_1?.toFixed(2) || 'N/A'} MPa`, margin, yPos);
          yPos += 5;
          doc.text(`  σ₂: ${result.sigma_2?.toFixed(2) || 'N/A'} MPa`, margin, yPos);
          yPos += 5;
          doc.text(`  τ₁₂: ${result.tau_12?.toFixed(2) || 'N/A'} MPa`, margin, yPos);
          yPos += 5;
          doc.text(`  von Mises: ${result.vonMises?.toFixed(2) || 'N/A'} MPa`, margin, yPos);
          yPos += 7;
          doc.setFont('helvetica', 'bold');
        });
      }

      // Save the PDF
      doc.save(`composite-analysis-${Date.now()}.pdf`);
      toast.success('PDF report generated successfully');
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
