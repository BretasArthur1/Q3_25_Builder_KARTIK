#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ReadmeGenerator {
  constructor() {
    this.programs = [];
    this.rootPath = process.cwd();
  }

  // Check if directory contains an Anchor project
  isAnchorProject(dirPath) {
    return fs.existsSync(path.join(dirPath, 'Anchor.toml')) && 
           fs.existsSync(path.join(dirPath, 'programs'));
  }

  // Parse Anchor.toml to get program info
  parseAnchorToml(dirPath) {
    const anchorTomlPath = path.join(dirPath, 'Anchor.toml');
    if (!fs.existsSync(anchorTomlPath)) return null;

    const content = fs.readFileSync(anchorTomlPath, 'utf8');
    const lines = content.split('\n');
    
    let inProgramsSection = false;
    const programs = {};
    
    for (const line of lines) {
      if (line.trim().startsWith('[programs.')) {
        inProgramsSection = true;
        continue;
      }
      
      if (line.trim().startsWith('[') && inProgramsSection) {
        break;
      }
      
      if (inProgramsSection && line.includes('=')) {
        const [name, address] = line.split('=').map(s => s.trim().replace(/"/g, ''));
        if (name && address) {
          programs[name] = address;
        }
      }
    }
    
    return programs;
  }

  // Get program description from lib.rs or other files
  getProgramDescription(dirPath, programName) {
    const descriptions = {
      'nft_staking': 'NFT staking mechanism with reward distribution',
      'escrow1': 'Trustless escrow system for secure asset exchange',
      'vault1': 'Secure vault system for asset storage and management',
      'turbin3Prereq': 'Turbin3 program prerequisites and enrollment system'
    };

    return descriptions[programName] || 'Solana program implementation';
  }

  // Scan workspace for programs
  scanWorkspace() {
    const entries = fs.readdirSync(this.rootPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const dirPath = path.join(this.rootPath, entry.name);
      
      // Skip common directories
      if (['node_modules', '.git', 'target', '.anchor'].includes(entry.name)) {
        continue;
      }

      if (this.isAnchorProject(dirPath)) {
        const programs = this.parseAnchorToml(dirPath);
        if (programs) {
          for (const [programName, address] of Object.entries(programs)) {
            this.programs.push({
              name: programName,
              directory: entry.name,
              address: address,
              description: this.getProgramDescription(dirPath, programName)
            });
          }
        }
      }
    }

    // Handle special cases like Turbin3-prereqs
    this.handleSpecialCases();
  }

  handleSpecialCases() {
    // Check for Turbin3 prerequisites
    const turbin3Path = path.join(this.rootPath, 'Turbin3-prereqs');
    if (fs.existsSync(turbin3Path)) {
      this.programs.push({
        name: 'Turbin3 Prerequisites',
        directory: 'Turbin3-prereqs',
        address: 'TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM',
        description: 'Program prerequisites and enrollment system for Turbin3'
      });
    }

    // Check for solana-starter
    const starterPath = path.join(this.rootPath, 'solana-starter');
    if (fs.existsSync(starterPath)) {
      this.programs.push({
        name: 'Solana Starter',
        directory: 'solana-starter',
        address: 'N/A',
        description: 'Starter templates and utilities for Solana development'
      });
    }
  }

  generateReadme() {
    let readme = `# Turbin3 Q3 Builder Program

My proof-of-work for the Solana Turbin3 Q3 Builder Program

## Programs

This workspace contains the following Solana programs:

`;

    // Sort programs by name
    this.programs.sort((a, b) => a.name.localeCompare(b.name));

    for (const program of this.programs) {
      readme += `### ${program.name}\n`;
      readme += `- **Directory**: \`${program.directory}/\`\n`;
      if (program.address !== 'N/A') {
        readme += `- **Program ID**: \`${program.address}\`\n`;
      }
      readme += `- **Description**: ${program.description}\n\n`;
    }

    readme += `## Project Structure

\`\`\`
turbine3/
`;

    // Add directory structure
    const dirs = this.programs.map(p => p.directory).filter((dir, index, self) => self.indexOf(dir) === index);
    for (const dir of dirs.sort()) {
      readme += `├── ${dir}/\n`;
    }

    readme += `└── README.md
\`\`\`

## Tech Stack

- **Rust** - Core program development
- **TypeScript** - Client-side implementations  
- **Anchor** - Solana development framework
- **Solana Web3.js** - Blockchain interactions

## Getting Started

Each program directory contains its own build and deployment scripts. Navigate to the specific program directory to build and test individual programs.

---

*This README is automatically generated. Run \`node generate-readme.js\` to update.*
`;

    return readme;
  }

  run() {
    console.log('Scanning workspace for Solana programs...');
    this.scanWorkspace();
    
    console.log(`Found ${this.programs.length} programs:`);
    this.programs.forEach(p => console.log(`  - ${p.name} (${p.directory})`));
    
    const readme = this.generateReadme();
    fs.writeFileSync('README.md', readme);
    
    console.log('README.md updated successfully!');
  }
}

// Run the generator
if (require.main === module) {
  const generator = new ReadmeGenerator();
  generator.run();
}

module.exports = ReadmeGenerator; 