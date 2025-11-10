import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { StressResult } from "@/types/materials";
import { 
  parseExperimentalData, 
  validateExperimentalData, 
  calculateValidationMetrics,
  ValidationResult 
} from "@/utils/experimentalValidation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExperimentalValidationProps {
  stressResults: StressResult[];
}

export function ExperimentalValidation({ stressResults }: ExperimentalValidationProps) {
  const [validations, setValidations] = useState<ValidationResult[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const experimentalData = parseExperimentalData(text);
      
      if (experimentalData.length === 0) {
        toast.error("No valid data found in CSV file");
        return;
      }

      const validationResults = validateExperimentalData(stressResults, experimentalData);
      const validationMetrics = calculateValidationMetrics(validationResults);

      setValidations(validationResults);
      setMetrics(validationMetrics);
      toast.success(`Validated ${validationResults.length} data points`);
    } catch (error) {
      toast.error("Failed to parse CSV file. Check format.");
      console.error(error);
    }
  };

  const downloadTemplate = () => {
    const template = `PlyNumber,Location,epsilon_x,epsilon_y,gamma_xy,sigma_x,sigma_y,tau_xy
1,top,0.001,0.0005,0.0002,100,50,25
1,bottom,0.0008,0.0004,0.0001,80,40,20
2,top,0.0012,0.0006,0.0003,120,60,30`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'experimental_data_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experimental Data Validation</CardTitle>
        <CardDescription>
          Upload strain gauge or test data to compare with theoretical predictions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline" 
            className="w-full"
            disabled={stressResults.length === 0}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Experimental Data (CSV)
          </Button>

          <Button 
            onClick={downloadTemplate} 
            variant="ghost" 
            className="w-full"
          >
            <FileText className="mr-2 h-4 w-4" />
            Download CSV Template
          </Button>
        </div>

        {stressResults.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Calculate stress results first to enable validation
            </AlertDescription>
          </Alert>
        )}

        {metrics && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-semibold">Validation Metrics:</div>
                <div className="text-sm grid grid-cols-2 gap-2">
                  <span>RMSE: {metrics.rmse.toFixed(2)}</span>
                  <span>Mean Error: {metrics.meanError.toFixed(2)}</span>
                  <span>Max Error: {metrics.maxError.toFixed(2)}</span>
                  <span>Mean % Error: {metrics.meanPercentError.toFixed(1)}%</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {validations.length > 0 && (
          <div className="max-h-96 overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ply</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Theoretical</TableHead>
                  <TableHead>Experimental</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>% Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validations.map((v, idx) => (
                  <TableRow key={idx} className={v.percentError > 10 ? 'bg-destructive/10' : ''}>
                    <TableCell>{v.plyNumber}</TableCell>
                    <TableCell className="capitalize">{v.location}</TableCell>
                    <TableCell className="font-mono text-xs">{v.parameter}</TableCell>
                    <TableCell>{v.theoretical.toFixed(4)}</TableCell>
                    <TableCell>{v.experimental.toFixed(4)}</TableCell>
                    <TableCell>{v.error.toFixed(4)}</TableCell>
                    <TableCell className={v.percentError > 10 ? 'text-destructive font-semibold' : ''}>
                      {v.percentError.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
