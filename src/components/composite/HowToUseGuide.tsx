import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function HowToUseGuide() {
  return (
    <Card className="p-6">
      <Accordion type="single" collapsible defaultValue="guide">
        <AccordionItem value="guide" className="border-none">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            How to Use This Application
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <h3 className="text-base font-semibold text-foreground mb-2">Step 1: Material Selection</h3>
              <p className="text-sm text-muted-foreground">
                Choose from predefined materials or create custom materials by defining their mechanical properties 
                (E₁, E₂, G₁₂, ν₁₂, strength values, density, thickness).
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground mb-2">Step 2: Build Ply Stack</h3>
              <p className="text-sm text-muted-foreground">
                Add plies to your laminate by selecting materials and defining fiber orientation angles. 
                The order matters - plies are numbered from bottom to top.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground mb-2">Step 3: Review Properties</h3>
              <p className="text-sm text-muted-foreground">
                Check the "Properties" tab to view the ABD stiffness matrix, equivalent engineering properties, 
                and cross-section visualization of your laminate.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground mb-2">Step 4: Define Loading</h3>
              <p className="text-sm text-muted-foreground">
                In the "Stress" tab, select geometry type (flat plate or tube), then input 
                force resultants (Nx, Ny, Nxy) and moment resultants (Mx, My, Mxy). You can also create and 
                save multiple load cases for different loading scenarios.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground mb-2">Step 5: Run Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Click "Calculate Stress/Strain" to perform the analysis. Results include ply-by-ply stresses, 
                strains, and failure indices. View visualizations in the "Visualization" section.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground mb-2">Step 6: Failure Analysis</h3>
              <p className="text-sm text-muted-foreground">
                In the "Failure" tab, configure failure criteria (Max Stress, Tsai-Wu, or Tsai-Hill), set safety factors, 
                and enable advanced analysis options (thermal, buckling, progressive failure, interlaminar stresses).
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground mb-2">Step 7: Save & Compare</h3>
              <p className="text-sm text-muted-foreground">
                Save your configurations for future use and compare different laminate designs in the "Saved Configurations" 
                section to optimize your design. Use "Load Cases" to save different loading scenarios.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground mb-2">Step 8: Export Results</h3>
              <p className="text-sm text-muted-foreground">
                Generate comprehensive PDF reports containing all analysis results, including ABD matrices, stress/strain 
                distributions, failure analyses, and visualizations. Use the "Export PDF Report" button in the header.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
