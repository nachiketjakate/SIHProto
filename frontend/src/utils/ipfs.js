import axios from 'axios'

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '6b997b949d54644ef46e'
const PINATA_BASE_URL = 'https://api.pinata.cloud'
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs'

// Configure axios instance for Pinata
const pinataAPI = axios.create({
  baseURL: PINATA_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${PINATA_API_KEY}`,
  },
})

/**
 * Upload a JSON object to IPFS via Pinata
 * @param {Object} data - The JSON data to upload
 * @param {string} name - Name for the file
 * @returns {Promise<string>} - IPFS hash (CID)
 */
export const uploadJSONToIPFS = async (data, name = 'data') => {
  try {
    const response = await pinataAPI.post('/pinning/pinJSONToIPFS', {
      pinataContent: data,
      pinataMetadata: {
        name: `${name}_${Date.now()}`,
        keyvalues: {
          type: 'json',
          timestamp: new Date().toISOString(),
        }
      }
    })

    return response.data.IpfsHash
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error)
    throw new Error('Failed to upload data to IPFS')
  }
}

/**
 * Upload a file to IPFS via Pinata
 * @param {File} file - The file to upload
 * @param {string} name - Name for the file
 * @returns {Promise<string>} - IPFS hash (CID)
 */
export const uploadFileToIPFS = async (file, name) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const metadata = JSON.stringify({
      name: name || file.name,
      keyvalues: {
        type: file.type,
        size: file.size.toString(),
        timestamp: new Date().toISOString(),
      }
    })
    formData.append('pinataMetadata', metadata)

    const response = await pinataAPI.post('/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })

    return response.data.IpfsHash
  } catch (error) {
    console.error('Error uploading file to IPFS:', error)
    throw new Error('Failed to upload file to IPFS')
  }
}

/**
 * Upload multiple files to IPFS via Pinata
 * @param {File[]} files - Array of files to upload
 * @param {string} folderName - Name for the folder
 * @returns {Promise<string>} - IPFS hash (CID) of the folder
 */
export const uploadFilesToIPFS = async (files, folderName = 'documents') => {
  try {
    const formData = new FormData()
    
    files.forEach((file, index) => {
      formData.append('file', file, `${index}_${file.name}`)
    })
    
    const metadata = JSON.stringify({
      name: `${folderName}_${Date.now()}`,
      keyvalues: {
        type: 'folder',
        fileCount: files.length.toString(),
        timestamp: new Date().toISOString(),
      }
    })
    formData.append('pinataMetadata', metadata)

    const response = await pinataAPI.post('/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })

    return response.data.IpfsHash
  } catch (error) {
    console.error('Error uploading files to IPFS:', error)
    throw new Error('Failed to upload files to IPFS')
  }
}

/**
 * Retrieve data from IPFS via Pinata gateway
 * @param {string} cid - IPFS hash (CID)
 * @returns {Promise<any>} - The retrieved data
 */
export const getFromIPFS = async (cid) => {
  try {
    const response = await axios.get(`${PINATA_GATEWAY}/${cid}`)
    return response.data
  } catch (error) {
    console.error('Error retrieving data from IPFS:', error)
    throw new Error('Failed to retrieve data from IPFS')
  }
}

/**
 * Get IPFS gateway URL for a given CID
 * @param {string} cid - IPFS hash (CID)
 * @returns {string} - Gateway URL
 */
export const getIPFSUrl = (cid) => {
  if (!cid) return ''
  return `${PINATA_GATEWAY}/${cid}`
}

/**
 * Upload project documentation to IPFS
 * @param {Object} projectData - Project information
 * @param {File[]} documents - Array of document files
 * @returns {Promise<string>} - IPFS hash (CID)
 */
export const uploadProjectDocumentation = async (projectData, documents = []) => {
  try {
    // Upload documents first if any
    let documentsHash = null
    if (documents.length > 0) {
      documentsHash = await uploadFilesToIPFS(documents, 'project_documents')
    }

    // Create comprehensive project metadata
    const projectMetadata = {
      ...projectData,
      documentsHash,
      uploadedAt: new Date().toISOString(),
      version: '1.0',
      standard: 'Blue Carbon Registry v1.0'
    }

    // Upload project metadata
    return await uploadJSONToIPFS(projectMetadata, 'project_metadata')
  } catch (error) {
    console.error('Error uploading project documentation:', error)
    throw error
  }
}

/**
 * Upload MRV (Monitoring, Reporting, Verification) data to IPFS
 * @param {Object} mrvData - MRV data including sensor readings, reports, etc.
 * @param {File[]} evidenceFiles - Array of evidence files
 * @returns {Promise<string>} - IPFS hash (CID)
 */
export const uploadMRVData = async (mrvData, evidenceFiles = []) => {
  try {
    // Upload evidence files first if any
    let evidenceHash = null
    if (evidenceFiles.length > 0) {
      evidenceHash = await uploadFilesToIPFS(evidenceFiles, 'mrv_evidence')
    }

    // Create comprehensive MRV metadata
    const mrvMetadata = {
      ...mrvData,
      evidenceHash,
      uploadedAt: new Date().toISOString(),
      version: '1.0',
      standard: 'Blue Carbon MRV v1.0'
    }

    // Upload MRV metadata
    return await uploadJSONToIPFS(mrvMetadata, 'mrv_data')
  } catch (error) {
    console.error('Error uploading MRV data:', error)
    throw error
  }
}

/**
 * Upload verification report to IPFS
 * @param {Object} verificationData - Verification report data
 * @param {File[]} verificationFiles - Array of verification files
 * @returns {Promise<string>} - IPFS hash (CID)
 */
export const uploadVerificationReport = async (verificationData, verificationFiles = []) => {
  try {
    // Upload verification files first if any
    let verificationFilesHash = null
    if (verificationFiles.length > 0) {
      verificationFilesHash = await uploadFilesToIPFS(verificationFiles, 'verification_files')
    }

    // Create comprehensive verification metadata
    const verificationMetadata = {
      ...verificationData,
      verificationFilesHash,
      uploadedAt: new Date().toISOString(),
      version: '1.0',
      standard: 'Blue Carbon Verification v1.0'
    }

    // Upload verification metadata
    return await uploadJSONToIPFS(verificationMetadata, 'verification_report')
  } catch (error) {
    console.error('Error uploading verification report:', error)
    throw error
  }
}

/**
 * Upload carbon credit token metadata to IPFS
 * @param {Object} creditData - Carbon credit token data
 * @returns {Promise<string>} - IPFS hash (CID)
 */
export const uploadCreditMetadata = async (creditData) => {
  try {
    // Create standard token metadata
    const tokenMetadata = {
      name: `Blue Carbon Credit - ${creditData.projectTitle}`,
      description: `Carbon credits from blue carbon project: ${creditData.description}`,
      image: creditData.imageUrl || '',
      external_url: creditData.projectUrl || '',
      attributes: [
        {
          trait_type: 'Project ID',
          value: creditData.projectId
        },
        {
          trait_type: 'Ecosystem Type',
          value: creditData.ecosystemType
        },
        {
          trait_type: 'Location',
          value: creditData.location
        },
        {
          trait_type: 'Verified Amount (tCO2e)',
          value: creditData.verifiedAmount
        },
        {
          trait_type: 'Vintage Year',
          value: creditData.vintageYear
        },
        {
          trait_type: 'Verification Standard',
          value: 'Blue Carbon Registry v1.0'
        }
      ],
      properties: {
        projectData: creditData.projectHash,
        mrvData: creditData.mrvHash,
        verificationData: creditData.verificationHash,
        createdAt: new Date().toISOString(),
        standard: 'ERC-721',
        version: '1.0'
      }
    }

    return await uploadJSONToIPFS(tokenMetadata, 'credit_metadata')
  } catch (error) {
    console.error('Error uploading credit metadata:', error)
    throw error
  }
}

/**
 * Upload retirement certificate to IPFS
 * @param {Object} retirementData - Retirement certificate data
 * @returns {Promise<string>} - IPFS hash (CID)
 */
export const uploadRetirementCertificate = async (retirementData) => {
  try {
    const certificateData = {
      ...retirementData,
      certificateId: `RET-${Date.now()}`,
      issuedAt: new Date().toISOString(),
      standard: 'Blue Carbon Registry Retirement Certificate v1.0',
      version: '1.0'
    }

    return await uploadJSONToIPFS(certificateData, 'retirement_certificate')
  } catch (error) {
    console.error('Error uploading retirement certificate:', error)
    throw error
  }
}

/**
 * Check if Pinata service is available
 * @returns {Promise<boolean>} - Service availability status
 */
export const checkPinataConnection = async () => {
  try {
    await pinataAPI.get('/data/testAuthentication')
    return true
  } catch (error) {
    console.error('Pinata connection failed:', error)
    return false
  }
}