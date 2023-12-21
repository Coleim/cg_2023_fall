import * as fs from 'fs';


let importSet = new Set();

function resolveImport(filePath: string, basePath: string): string {
    const content = fs.readFileSync(`${basePath}/${filePath}`, 'utf-8');
    return content.replace(/export\s+/g, '');
}

function getMergedContent(mainFilePath: string): string {
    let mainContent = fs.readFileSync(mainFilePath, 'utf-8');
    const basePath = mainFilePath.substring(0, mainFilePath.lastIndexOf('/'));

    const filesInDirectory = fs.readdirSync(basePath);
    // Filter out the mainFilePath from the list
    const otherFiles = filesInDirectory.filter(file => !mainFilePath.includes(file));

    const regex = /import\s*{\s*(\w+)\s*}\s*from\s*"\.\/(\w+)";\s*/g;

    let importBundle = "";
    otherFiles.forEach( file => {
        
        importBundle += resolveImport(file, basePath).replace(regex, '\n') + '\n\n';
    })

    console.log(importBundle)
    mainContent = importBundle + '\n\n' + mainContent.replace(regex, '\n');
    

    return mainContent;
}
function mergeFiles(mainFilePath: string): void {
    const mergedContent = getMergedContent(mainFilePath);
    fs.writeFileSync('mergedFile.ts', mergedContent);
}


// Replace 'main.ts' with the path to your main TypeScript file
mergeFiles('src/main.ts');