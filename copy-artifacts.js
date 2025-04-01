const fs = require('fs-extra');
const path = require('path');

async function copyArtifacts() {
  try {
    // Source: Where Hardhat generates the artifacts
    const artifactsDir = path.resolve(__dirname, 'artifacts');
    
    // Destination: Where your frontend expects to find them
    const frontendArtifactsDir = path.resolve(__dirname, 'frontend/src/artifacts');
    
    console.log(`Copying artifacts from ${artifactsDir} to ${frontendArtifactsDir}`);
    
    // Ensure the destination directory exists
    await fs.ensureDir(frontendArtifactsDir);
    
    // Copy the entire artifacts directory
    await fs.copy(artifactsDir, frontendArtifactsDir);
    
    console.log('Artifacts copied successfully!');
  } catch (error) {
    console.error('Error copying artifacts:', error);
    process.exit(1);
  }
}

// Run the copy function
copyArtifacts();