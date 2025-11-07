import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function EducationalContent() {
  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-6 pr-4">
        {/* Introduction */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">About This Application</h2>
          <p className="text-muted-foreground leading-relaxed">
            This Composite Laminate Structural Analysis Tool is designed to analyze and predict the mechanical behavior 
            of composite laminate structures. It implements Classical Lamination Theory (CLT) and advanced failure analysis 
            methods to provide comprehensive structural insights for engineering applications.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            The tool enables engineers and researchers to design, analyze, and optimize composite structures for various 
            applications including aerospace, automotive, marine, and civil engineering.
          </p>
        </Card>

        {/* Mathematical Foundation */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Mathematical Foundation</h2>
          
          <h3 className="text-xl font-semibold text-foreground mb-3">Classical Lamination Theory (CLT)</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Classical Lamination Theory is the fundamental framework used to analyze laminated composite materials. 
            It relates the applied forces and moments to the resulting strains and curvatures through the ABD stiffness matrix.
          </p>

          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <p className="text-sm font-mono text-foreground">
              [N, M]ᵀ = [A, B; B, D] × [ε⁰, κ]ᵀ
            </p>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Where:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>N</strong> = In-plane force resultants (Nx, Ny, Nxy)</li>
              <li><strong>M</strong> = Moment resultants (Mx, My, Mxy)</li>
              <li><strong>ε⁰</strong> = Mid-plane strains</li>
              <li><strong>κ</strong> = Plate curvatures</li>
              <li><strong>A</strong> = Extensional stiffness matrix (3×3)</li>
              <li><strong>B</strong> = Coupling stiffness matrix (3×3)</li>
              <li><strong>D</strong> = Bending stiffness matrix (3×3)</li>
            </ul>
          </div>

          <Separator className="my-4" />

          <h3 className="text-xl font-semibold text-foreground mb-3">ABD Matrix Components</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">A Matrix (Extensional Stiffness):</h4>
              <div className="bg-muted/50 p-3 rounded-lg mb-2">
                <p className="text-sm font-mono text-foreground">
                  Aᵢⱼ = Σₖ (Q̄ᵢⱼ)ₖ × (zₖ - zₖ₋₁)
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Represents the in-plane stiffness of the laminate. Non-zero B matrix indicates coupling between 
                extension and bending.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">B Matrix (Coupling Stiffness):</h4>
              <div className="bg-muted/50 p-3 rounded-lg mb-2">
                <p className="text-sm font-mono text-foreground">
                  Bᵢⱼ = (1/2) × Σₖ (Q̄ᵢⱼ)ₖ × (zₖ² - zₖ₋₁²)
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Coupling between bending and extension. Zero for symmetric laminates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">D Matrix (Bending Stiffness):</h4>
              <div className="bg-muted/50 p-3 rounded-lg mb-2">
                <p className="text-sm font-mono text-foreground">
                  Dᵢⱼ = (1/3) × Σₖ (Q̄ᵢⱼ)ₖ × (zₖ³ - zₖ₋₁³)
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Represents the bending stiffness of the laminate.
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <h3 className="text-xl font-semibold text-foreground mb-3">Transformed Stiffness Matrix</h3>
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <p className="text-sm font-mono text-foreground mb-2">
              Q̄ᵢⱼ = T × Qᵢⱼ × Tᵀ
            </p>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Where <strong>Q̄</strong> is the transformed reduced stiffness matrix for each ply at angle θ, 
            and <strong>T</strong> is the transformation matrix based on cos(θ) and sin(θ).
          </p>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Reduced Stiffness Components:</strong></p>
            <div className="bg-muted/50 p-3 rounded-lg space-y-1">
              <p className="font-mono">Q₁₁ = E₁ / (1 - ν₁₂ν₂₁)</p>
              <p className="font-mono">Q₂₂ = E₂ / (1 - ν₁₂ν₂₁)</p>
              <p className="font-mono">Q₁₂ = ν₁₂E₂ / (1 - ν₁₂ν₂₁)</p>
              <p className="font-mono">Q₆₆ = G₁₂</p>
            </div>
          </div>
        </Card>

        {/* Failure Criteria */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Failure Analysis Methods</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Maximum Stress Criterion</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Failure occurs when any stress component exceeds the corresponding strength:
              </p>
              <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-sm font-mono">
                <p className="text-foreground">|σ₁| ≤ Xᵗ (tension) or Xᶜ (compression)</p>
                <p className="text-foreground">|σ₂| ≤ Yᵗ (tension) or Yᶜ (compression)</p>
                <p className="text-foreground">|τ₁₂| ≤ S</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Tsai-Wu Criterion</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Interactive polynomial failure criterion that accounts for stress interactions:
              </p>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                <p className="text-foreground">
                  F₁σ₁ + F₂σ₂ + F₁₁σ₁² + F₂₂σ₂² + F₆₆τ₁₂² + 2F₁₂σ₁σ₂ ≤ 1
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Tsai-Hill Criterion</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Quadratic failure criterion derived from Von Mises yield criterion:
              </p>
              <div className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                <p className="text-foreground">
                  (σ₁/X)² - (σ₁σ₂/X²) + (σ₂/Y)² + (τ₁₂/S)² ≤ 1
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Advanced Analysis */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Advanced Analysis Features</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Progressive Failure Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Simulates the progressive degradation of the laminate by reducing stiffness of failed plies 
                and redistributing loads until ultimate failure or all plies fail.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Buckling Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Calculates critical buckling loads for plates and cylindrical shells under various loading conditions 
                using eigenvalue analysis of the stiffness matrices.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Thermal Stress Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Evaluates thermally-induced stresses due to temperature changes, accounting for different 
                coefficients of thermal expansion in each ply direction.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Interlaminar Stress Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Calculates out-of-plane shear and normal stresses between plies, which are critical for 
                delamination failure prediction.
              </p>
            </div>
          </div>
        </Card>

        {/* How to Use */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">How to Use This Application</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 1: Material Selection</h3>
              <p className="text-sm text-muted-foreground">
                Choose from predefined materials or create custom materials by defining their mechanical properties 
                (E₁, E₂, G₁₂, ν₁₂, strength values, density, thickness).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 2: Build Ply Stack</h3>
              <p className="text-sm text-muted-foreground">
                Add plies to your laminate by selecting materials and defining fiber orientation angles. 
                The order matters - plies are numbered from bottom to top.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 3: Review Properties</h3>
              <p className="text-sm text-muted-foreground">
                Check the "Properties" tab to view the ABD stiffness matrix, equivalent engineering properties, 
                and cross-section visualization of your laminate.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 4: Define Loading</h3>
              <p className="text-sm text-muted-foreground">
                In the "Stress" tab, select geometry type (flat plate, tube, or pressure vessel), then input 
                force resultants (Nx, Ny, Nxy) and moment resultants (Mx, My, Mxy).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 5: Run Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Click "Calculate Stress/Strain" to perform the analysis. Results include ply-by-ply stresses, 
                strains, and failure indices. View visualizations in the "Visualization" tab.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 6: Failure Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Switch to the "Failure" tab to configure failure criteria, safety factors, and enable advanced 
                analysis options (thermal, buckling, progressive failure).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 7: Save & Compare</h3>
              <p className="text-sm text-muted-foreground">
                Save your configurations for future use and compare different laminate designs in the "Stacks" 
                tab to optimize your design. Use "Load Cases" to save different loading scenarios.
              </p>
            </div>
          </div>
        </Card>

        {/* Applications */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Application Scope</h2>
          
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Aerospace:</strong> Aircraft structures, satellite components, UAV frames</p>
            <p><strong className="text-foreground">Automotive:</strong> Chassis components, body panels, drive shafts</p>
            <p><strong className="text-foreground">Marine:</strong> Boat hulls, masts, propeller shafts</p>
            <p><strong className="text-foreground">Civil Engineering:</strong> Bridge decks, reinforcement systems, architectural elements</p>
            <p><strong className="text-foreground">Sports Equipment:</strong> Bicycle frames, tennis rackets, skis</p>
            <p><strong className="text-foreground">Pressure Vessels:</strong> Storage tanks, piping systems</p>
          </div>
        </Card>

        {/* Credits */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Development Credits</h2>
            <Separator className="my-4" />
            <p className="text-lg text-foreground font-semibold">
              Developed by PhD Candidate Ursache Stefan
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This tool represents cutting-edge research in composite materials analysis and design optimization.
            </p>
          </div>
        </Card>
      </div>
    </ScrollArea>
  );
}
