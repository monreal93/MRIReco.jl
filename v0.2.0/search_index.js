var documenterSearchIndex = {"docs":
[{"location":"index.html#MRIReco.jl-1","page":"Home","title":"MRIReco.jl","text":"","category":"section"},{"location":"index.html#","page":"Home","title":"Home","text":"Magnetic Resonance Imaging Reconstruction","category":"page"},{"location":"index.html#Introduction-1","page":"Home","title":"Introduction","text":"","category":"section"},{"location":"index.html#","page":"Home","title":"Home","text":"MPIReco is a Julia packet for magnetic resonance imaging. It contains algorithms for the simulation and reconstruction of MRT data and is both easy to use and flexibly expandable.","category":"page"},{"location":"index.html#","page":"Home","title":"Home","text":"Both direct and iterative methods are available for image reconstruction. In particular, modern compressed sensing algorithms such as ADMM can be used.","category":"page"},{"location":"index.html#","page":"Home","title":"Home","text":"The MRT imaging operator can be set up for a variety of scanning patterns (cartesian, spiral, radial, ...) and can take into account field inhomogeneity as well as the use of coil arrays. The operator can be quickly evaluated using NFFT-based methods.","category":"page"},{"location":"index.html#","page":"Home","title":"Home","text":"One strength of the package is that it is strongly modular and uses high quality Julia packages. These are e.g.","category":"page"},{"location":"index.html#","page":"Home","title":"Home","text":"NFFT.jl and FFTW.jl for fast Fourier transformations\nWavelets.jl for sparsification\nLinearOperators.jl in order to be able to divide the imaging operator modularly into individual parts\nRegularizedLeastSquares.jl for modern algorithms for solving linear optimization problems","category":"page"},{"location":"index.html#","page":"Home","title":"Home","text":"This interaction allows new algorithms to be easily integrated into the software framework. It is not necessary to program in C/C++ but the advantages of the scientific high-level language Julia can be used.","category":"page"},{"location":"index.html#","page":"Home","title":"Home","text":"note: Note\nMRIReco.jl is work in progress and in some parts not entirely optimized. In particular the FFT and NFFT implementation are currently limited to the CPU and do not support GPU acceleration yet.","category":"page"},{"location":"index.html#Installation-1","page":"Home","title":"Installation","text":"","category":"section"},{"location":"index.html#","page":"Home","title":"Home","text":"Start julia and open the package mode by entering ]. The enter","category":"page"},{"location":"index.html#","page":"Home","title":"Home","text":"add https://github.com/tknopp/RegularizedLeastSquares.jl\nadd https://github.com/MagneticResonanceImaging/MRIReco.jl","category":"page"},{"location":"index.html#","page":"Home","title":"Home","text":"This will install the packages RegularizedLeastSquares.jl, MRIReco.jl, and all its dependencies.","category":"page"},{"location":"gettingStarted.html#Getting-Started-1","page":"Getting Started","title":"Getting Started","text":"","category":"section"},{"location":"gettingStarted.html#","page":"Getting Started","title":"Getting Started","text":"We will start with a very simple example and perform simple simulation and reconstruction based on a shepp logan phantom. The program looks like this","category":"page"},{"location":"gettingStarted.html#","page":"Getting Started","title":"Getting Started","text":"# image\nN = 256\nI = shepp_logan(N)\n\n# simulation parameters\nparams = Dict{Symbol, Any}()\nparams[:simulation] = \"fast\"\nparams[:trajName] = \"Radial\"\nparams[:numProfiles] = floor(Int64, pi/2*N)\nparams[:numSamplingPerProfile] = 2*N\n\n# do simulation\nacqData = simulation(I, params)\n\n# reco parameters\nparams = Dict{Symbol, Any}()\nparams[:reco] = \"direct\"\nparams[:shape] = (N,N)\nIreco = reconstruction(acqData, params)","category":"page"},{"location":"gettingStarted.html#","page":"Getting Started","title":"Getting Started","text":"We will go through the program step by step. First we create a 2D shepp logan phantom of size N=256. Then we setup a dictionary that defines the simulation parameters. Here, we chose a simple radial trajectory with 402 spokes and 512 samples per profile. We use a gridding-based simulator by setting params[:simulation] = \"fast\"","category":"page"},{"location":"gettingStarted.html#","page":"Getting Started","title":"Getting Started","text":"After setting up the parameter dictionary params, the simulation is performed by calling","category":"page"},{"location":"gettingStarted.html#","page":"Getting Started","title":"Getting Started","text":"acqData = simulation(I, params)","category":"page"},{"location":"gettingStarted.html#","page":"Getting Started","title":"Getting Started","text":"The result simulation function outputs an acquisition object that is discussed in more detail in the section Acquisition Data. The acquisition data can also be stored to or loaded from a file, which will be discussed in section File Handling.","category":"page"},{"location":"gettingStarted.html#","page":"Getting Started","title":"Getting Started","text":"Using the acquisition data we can perform a reconstruction. To this end, again a parameter dictionary is setup and some basic configuration is done. In this case, for instance we specify that we want to apply a simple NFFT-based gridding reconstruction. The reconstruction is invoked by calling","category":"page"},{"location":"gettingStarted.html#","page":"Getting Started","title":"Getting Started","text":"Ireco = reconstruction(acqData, params)","category":"page"},{"location":"gettingStarted.html#","page":"Getting Started","title":"Getting Started","text":"The resulting image is of type AxisArray and has 5 dimensions. One can display the image object by calling","category":"page"},{"location":"gettingStarted.html#","page":"Getting Started","title":"Getting Started","text":"using ImageView\nimshow(abs.(Ireco[:,:,1,1,1]))","category":"page"},{"location":"gettingStarted.html#","page":"Getting Started","title":"Getting Started","text":"Alternatively one can store the image into a file, which will be discussed in the section on Images.","category":"page"},{"location":"gettingStarted.html#","page":"Getting Started","title":"Getting Started","text":"The original phantom and the reconstructed image are shown below","category":"page"},{"location":"gettingStarted.html#","page":"Getting Started","title":"Getting Started","text":"(Image: Phantom) (Image: Reconstruction)","category":"page"},{"location":"gettingStarted.html#","page":"Getting Started","title":"Getting Started","text":"We will discuss reconstruction in more detail in the Reconstruction section. Simulation will be discussed in more detail in the Simulation section.","category":"page"},{"location":"acquisitionData.html#Acquisition-Data-1","page":"Acquisition Data","title":"Acquisition Data","text":"","category":"section"},{"location":"acquisitionData.html#","page":"Acquisition Data","title":"Acquisition Data","text":"All acquisition data is stored in the a type that looks like this","category":"page"},{"location":"acquisitionData.html#","page":"Acquisition Data","title":"Acquisition Data","text":"mutable struct AcquisitionData{S<:AbstractSequence}\n  seq::S\n  kdata::Vector{ComplexF64}\n  numEchoes::Int64\n  numCoils::Int64\n  numSlices::Int64\n  samplePointer::Vector{Int64}\n  subsampleIndices::Array{Int64}\n  encodingSize::Vector{Int64}\n  fov::Vector{Float64}\nend","category":"page"},{"location":"acquisitionData.html#","page":"Acquisition Data","title":"Acquisition Data","text":"The composite type consists of the imaging sequence, the k-space data, several parameters describing the dimension of the data and some additional index vectors.","category":"page"},{"location":"acquisitionData.html#","page":"Acquisition Data","title":"Acquisition Data","text":"The k-space data kdata is flattened into a 1D vector but it represents data from a 4D space with dimensions","category":"page"},{"location":"acquisitionData.html#","page":"Acquisition Data","title":"Acquisition Data","text":"kspace nodes\necho times\ncoils\nslices / repetitions","category":"page"},{"location":"acquisitionData.html#","page":"Acquisition Data","title":"Acquisition Data","text":"The reason to use a flattened 1D data is that the number k-space nodes needs not to be constant for different echo times. The entry point to the data is stored in the index vector samplePointer. It has length","category":"page"},{"location":"acquisitionData.html#","page":"Acquisition Data","title":"Acquisition Data","text":"numEchoes * numCoils * numSlices","category":"page"},{"location":"acquisitionData.html#","page":"Acquisition Data","title":"Acquisition Data","text":"and gives for each combination of echo, coil and slice the corresponding index, where the k-space data starts. The end-point can be obtained by incrementing the index by one.","category":"page"},{"location":"acquisitionData.html#","page":"Acquisition Data","title":"Acquisition Data","text":"In case of undersampled data, the subsampling indices are stored in subsampleIndices. One check if the data is undersampled by checking if isempty(subsampleIndices).","category":"page"},{"location":"acquisitionData.html#","page":"Acquisition Data","title":"Acquisition Data","text":"The encoded space is stored in the field encodingSize. It is especially relevant for non-Cartesian trajectories where it is not clear upfront, how large the grid size for reconstruction can be chosen. Finally fov describes the physical lengths of the encoding grid.","category":"page"},{"location":"filehandling.html#File-Handling-1","page":"File Handling","title":"File Handling","text":"","category":"section"},{"location":"filehandling.html#","page":"File Handling","title":"File Handling","text":"MRI Acquisition Data can not only be generated from Simulation but also from files. Currently, MRIReco supports the ISMRMRD data format and a custom MRILib specific data format. Both formats are a subtype of MRIFile and implement the functions","category":"page"},{"location":"filehandling.html#","page":"File Handling","title":"File Handling","text":"trajectory(f::MRIFile)\nsequence(f::MRIFile)\nrawdata(f::MRIFile)\nAcquisitionData(f::MRIFile)","category":"page"},{"location":"filehandling.html#","page":"File Handling","title":"File Handling","text":"which allow to access specific parts of the MRIFile. The last function AcquisitionData returns an AcquisitionData data object which can be used directly in the Reconstruction methods.","category":"page"},{"location":"image.html#Images-1","page":"Images","title":"Images","text":"","category":"section"},{"location":"image.html#","page":"Images","title":"Images","text":"All reconstructed data is stored as an AxisArray. The AxisArrays package is part of the Images package family, which groups all image processing related functionality together. We note that the term Image does not restrict the dimensionality of the data types to 2D but in fact images can be of arbitrary dimensionality.","category":"page"},{"location":"image.html#","page":"Images","title":"Images","text":"The reconstructed MRI image I is an AxisArray and has five dimensions. The first three are the spatial dimension x, y, and z, whereas dimension four encodes the number of echos that have been reconstructed, while dimension five encodes individual coils that may have been reconstructed independently. By using an AxisArray the object does not only consist of the data but it additionally encodes the physical size of the image as well as the echo times. To extract the ordinary Julia array one can simply use Ireco.data.","category":"page"},{"location":"image.html#","page":"Images","title":"Images","text":"The advantage of encoding the physical dimensions is the image data can be stored without loosing the dimensions of the data. For instance one can call","category":"page"},{"location":"image.html#","page":"Images","title":"Images","text":"saveImage(filename, I)","category":"page"},{"location":"image.html#","page":"Images","title":"Images","text":"to store the image and","category":"page"},{"location":"image.html#","page":"Images","title":"Images","text":"I = loadImage(filename)","category":"page"},{"location":"image.html#","page":"Images","title":"Images","text":"to load the image. Currently, MRIReco does support the NIfTI file format. By default, saveImage stores the data complex valued if the image I is complex valued. To store the magnitude image one can call","category":"page"},{"location":"image.html#","page":"Images","title":"Images","text":"saveImage(filename, I, true)","category":"page"},{"location":"offresonance.html#Offresonance-correction-1","page":"Offresonance","title":"Offresonance correction","text":"","category":"section"},{"location":"offresonance.html#","page":"Offresonance","title":"Offresonance","text":"For trajectories with long readouts the MRI images are degraded by offresonance artifacts, if the offresonance is not taken into account during reconstruction. We provide fast algorithms that are capable of correcting offresonance artifacts provided that the offresonance map is known. Our framework is also capable of correcting T2* relaxation effects. The later are encoded in the real part of the correction map while the offresoanance is encoded in the imaginary part. The following example shows an example of a simulation and reconstruction of MRI data that takes offresonance due to an inhomogeneous fieldmap into account.","category":"page"},{"location":"offresonance.html#","page":"Offresonance","title":"Offresonance","text":"using MRIReco\n\nN = 256\nI = shepp_logan(N)\nI = circularShutterFreq!(I,1)\ncmap = 1im*quadraticFieldmap(N,N,125*2pi)\n\n# simulation parameters\nparams = Dict{Symbol, Any}()\nparams[:simulation] = \"fast\"\nparams[:trajName] = \"Spiral\"\nparams[:numProfiles] = 1\nparams[:numSamplingPerProfile] = N*N\nparams[:windings] = 128\nparams[:AQ] = 3.0e-2\nparams[:correctionMap] = cmap[:,:,1]\n\n# do simulation\nacqData = simulation(I, params)\n\n# reco parameters\nparams = Dict{Symbol, Any}()\nparams[:reco] = \"direct\"\nparams[:shape] = (N,N)\nparams[:correctionMap] = cmap\nparams[:alpha] = 1.75\nparams[:m] = 4.0\nparams[:K] = 28\nIreco = reconstruction(acqData, params)","category":"page"},{"location":"offresonance.html#","page":"Offresonance","title":"Offresonance","text":"The considered quadratic fieldmap looks like this:","category":"page"},{"location":"offresonance.html#","page":"Offresonance","title":"Offresonance","text":"(Image: Phantom)","category":"page"},{"location":"offresonance.html#","page":"Offresonance","title":"Offresonance","text":"The reconstruction without and with offresonance correction are shown below:","category":"page"},{"location":"offresonance.html#","page":"Offresonance","title":"Offresonance","text":"(Image: Phantom) (Image: Reconstruction)","category":"page"},{"location":"SENSE.html#Parallel-Imaging-1","page":"Parallel Imaging","title":"Parallel Imaging","text":"","category":"section"},{"location":"SENSE.html#","page":"Parallel Imaging","title":"Parallel Imaging","text":"For parallel imaging MRIReco.jl uses an iterative SENSE approach. In the following code example we show how to simulate MRI data with an array of 8 coils and a corresponding SENSE reconstruction.","category":"page"},{"location":"SENSE.html#","page":"Parallel Imaging","title":"Parallel Imaging","text":"N = 256\nnumCoils = 8\nI = shepp_logan(N)\nI = circularShutterFreq!(I,1)\n\ncoilsens = birdcageSensitivity(N, 8, 1.5)\n\n# simulation parameters\nparams = Dict{Symbol, Any}()\nparams[:simulation] = \"fast\"\nparams[:trajName] = \"Spiral\"\nparams[:numProfiles] = 1\nparams[:numSamplingPerProfile] = div(N*N,2)\nparams[:windings] = div(N,4)\nparams[:AQ] = 3.0e-2\nparams[:senseMaps] = coilsens\n\n# do simulation\nacqData = simulation(I, params)\n\n# reco parameters\nparams = Dict{Symbol, Any}()\nparams[:reco] = \"multiCoil\"\nparams[:shape] = (N,N)\nparams[:regularization] = \"L2\"\nparams[:iterations] = 10\nparams[:solver] = \"admm\"\nparams[:senseMaps] = coilsens\n\nIreco = reconstruction(acqData, params)\n","category":"page"},{"location":"trajectories.html#Trajectory-1","page":"Trajectory","title":"Trajectory","text":"","category":"section"},{"location":"trajectories.html#","page":"Trajectory","title":"Trajectory","text":"Several typical MRI k-space trajectories are available:","category":"page"},{"location":"trajectories.html#","page":"Trajectory","title":"Trajectory","text":"Cartesian\nEPI\nRadial\nSpiral","category":"page"},{"location":"trajectories.html#","page":"Trajectory","title":"Trajectory","text":"In addition, there is a CustomTrajectory type for implementing arbitrary k-space trajectories. Currently, most of the trajectories are only available in 2D. Each trajectory is of type Trajectory and implements the following functions","category":"page"},{"location":"trajectories.html#","page":"Trajectory","title":"Trajectory","text":"string(tr::Trajectory)\nkspaceNodes(tr::Trajectory)\nreadoutTimes(tr::Trajectory)","category":"page"},{"location":"trajectories.html#","page":"Trajectory","title":"Trajectory","text":"For instance we can define a spiral trajectory using ...","category":"page"},{"location":"trajectories.html#","page":"Trajectory","title":"Trajectory","text":"...","category":"page"},{"location":"trajectories.html#","page":"Trajectory","title":"Trajectory","text":"(Image: Phantom)","category":"page"},{"location":"operators.html#Imaging-Operators-1","page":"Imaging Operators","title":"Imaging Operators","text":"","category":"section"},{"location":"operators.html#","page":"Imaging Operators","title":"Imaging Operators","text":"The mapping between the proton density and the recorded signal is linear in MRI and can be described in the continuous case as an integral equation and in the discrete case as a matrix vector multiplication.","category":"page"},{"location":"operators.html#","page":"Imaging Operators","title":"Imaging Operators","text":"Depending on the imaging scenario, the MRI system matrix can have various different forms. It may encode a Cartesian, or a spiral trajectory. It may take offresonance into account, and it may also encode the sensitivity of the receive coil.","category":"page"},{"location":"operators.html#","page":"Imaging Operators","title":"Imaging Operators","text":"MRIReco implements various MRI imaging operators. In all cases, the operators have a dedicated Julia type that acts as a matrix. The operator E thus can be applied to a vector x by calling E*x. Similarly, the adjoint can be applied by adjoint(E)*x. We note at this point that the adjoint operation is lazy in Julia and thus the matrix adjoint(E) is never explicitly arranged.","category":"page"},{"location":"operators.html#","page":"Imaging Operators","title":"Imaging Operators","text":"MRIReco currently implements the following operators:","category":"page"},{"location":"operators.html#","page":"Imaging Operators","title":"Imaging Operators","text":"FFTOp: A multidimensional FFT operator\nNFFTOp: A multidimensional operator for non-equidistant FFTs\nFieldmapNFFTOp: An operator that takes complex correction terms into account\nSensitivityMapOp: An operator for building a SENSE reconstruction. Has to be combined with one of the former encoding operators\nSamplingOp: An operator that describes the (sub)sampling of full trajectories. The operator is used for Compressed Sensing reconstruction\nWaveletOp: A multidimensional operator for applying Wavelet transformations","category":"page"},{"location":"operators.html#","page":"Imaging Operators","title":"Imaging Operators","text":"Each of these operators can be build by calling the corresponding constructor. Alternatively one can use the EncodingOp constructor that allows for high-level construction of the imaging operator.","category":"page"},{"location":"simulation.html#Simulation-1","page":"Simulation","title":"Simulation","text":"","category":"section"},{"location":"simulation.html#","page":"Simulation","title":"Simulation","text":"simulation(image::Array{Float64}, simParams::Dict)","category":"page"},{"location":"reconstruction.html#Reconstruction-1","page":"Reconstruction","title":"Reconstruction","text":"","category":"section"},{"location":"reconstruction.html#","page":"Reconstruction","title":"Reconstruction","text":"reconstruction(acqData::AcquisitionData, recoParams::Dict)","category":"page"},{"location":"reconstruction.html#MRIReco.reconstruction-Tuple{AcquisitionData,Dict}","page":"Reconstruction","title":"MRIReco.reconstruction","text":"reconstruction(acqData::AcquisitionData, recoParams::Dict)\n\nThe reconstruction method takes an AcquisitionData object and a parameter dictionary and calculates an image from the given raw data.\n\n\n\n\n\n","category":"method"}]
}
