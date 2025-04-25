export const sampleQuestionsByTopic = {
  "CNN": [
    {
      question: "What does CNN stand for in the context of deep learning?",
      type: "multiple_choice",
      options: [
        "Computer Neural Network",
        "Convolutional Neural Network",
        "Calculated Neuron Network",
        "Cognitive Neural Network"
      ],
      correctAnswer: "Convolutional Neural Network",
      explanation: "CNN stands for Convolutional Neural Network, which is a class of deep neural networks commonly applied to analyzing visual imagery."
    },
    {
      question: "Which of the following is NOT a typical layer in a CNN?",
      type: "multiple_choice",
      options: [
        "Convolutional Layer",
        "Pooling Layer",
        "Distribution Layer",
        "Fully Connected Layer"
      ],
      correctAnswer: "Distribution Layer",
      explanation: "Distribution Layer is not a standard layer in CNNs. The typical layers include Convolutional, Pooling, ReLU, and Fully Connected layers."
    },
    {
      question: "What is the main purpose of the pooling layer in a CNN?",
      type: "multiple_choice",
      options: [
        "To add more features",
        "To reduce dimensionality",
        "To increase network depth",
        "To normalize pixel values"
      ],
      correctAnswer: "To reduce dimensionality",
      explanation: "Pooling layers reduce the spatial dimensions (width and height) of the input volume, which helps reduce computation and parameters."
    },
    {
      question: "CNNs are primarily used for image classification.",
      type: "true_false",
      correctAnswer: true,
      explanation: "True. While CNNs have been adapted for other tasks, they were primarily designed for and excel at image-related tasks like classification."
    },
    {
      question: "A 3x3 convolutional filter will look at 3 pixels at a time in an image.",
      type: "true_false",
      correctAnswer: false,
      explanation: "False. A 3x3 filter looks at 9 pixels (in a 3x3 grid) at a time as it slides across the image."
    },
    {
      question: "Pooling layers contain trainable parameters.",
      type: "true_false",
      correctAnswer: false,
      explanation: "False. Pooling layers perform fixed operations (like max or average) and don't have trainable parameters."
    },
    {
      question: "Explain how convolutional layers work in a CNN and why they are effective for image processing.",
      type: "written",
      correctAnswer: "Convolutional layers apply filters/kernels to input images by sliding them across the image and computing dot products at each position. This creates feature maps highlighting patterns like edges, textures, and shapes. They're effective for images because they: 1) maintain spatial relationships between pixels, 2) apply the same filter across the entire image (parameter sharing), reducing parameters, and 3) exhibit translation invariance, detecting features regardless of position.",
      explanation: "A good answer should cover the sliding window mechanism, feature map creation, parameter sharing, and why this approach works well for visual data."
    },
    {
      question: "Describe the concept of feature hierarchies in CNNs and how deeper layers capture more complex features.",
      type: "written",
      correctAnswer: "In CNNs, feature hierarchies refer to how different layers learn progressively more complex and abstract features. Early layers detect basic features like edges and corners. Middle layers combine these to recognize textures and simple patterns. Deeper layers identify complex objects or object parts by combining simpler patterns. This hierarchical learning mirrors how human visual processing works, allowing CNNs to build complex representations from simple building blocks.",
      explanation: "A good answer should explain the progression from simple to complex features through the network layers."
    },
    {
      question: "Explain the vanishing gradient problem in deep CNNs and at least one method to address it.",
      type: "written",
      correctAnswer: "The vanishing gradient problem occurs in deep CNNs when gradients become extremely small as they're backpropagated through many layers, causing earlier layers to learn very slowly or not at all. Solutions include: 1) Using ReLU activation functions instead of sigmoid/tanh, as ReLU doesn't saturate for positive values, 2) Implementing residual connections (ResNets) that create shortcuts allowing gradients to flow more easily, 3) Batch normalization to stabilize and normalize activations, 4) Careful weight initialization methods like He initialization.",
      explanation: "A good answer should define the problem and mention at least one valid solution like ReLU activations, skip/residual connections, batch normalization, or proper initialization."
    },
    {
      question: "Compare and contrast max pooling and average pooling in CNNs.",
      type: "written",
      correctAnswer: "Max pooling and average pooling are downsampling techniques in CNNs that reduce spatial dimensions. Max pooling takes the maximum value from each window, emphasizing the most prominent features and is good at preserving texture details and important features. It's more commonly used as it helps create translation invariance. Average pooling takes the average of values in each window, providing a smoother output that preserves more background information but may lose some distinctive features. Max pooling is typically used in earlier layers to detect specific features, while average pooling might be used in later layers or for tasks requiring smoother representations.",
      explanation: "A good answer should clearly explain both methods, their differences, and appropriate use cases."
    }
  ],
  "Google net": [
    {
      question: "What is the other name for GoogleNet?",
      type: "multiple_choice",
      options: [
        "AlexNet",
        "Inception",
        "ResNet",
        "VGGNet"
      ],
      correctAnswer: "Inception",
      explanation: "GoogleNet is also known as Inception. It was developed by Google researchers and won the ILSVRC (ImageNet) challenge in 2014."
    },
    {
      question: "Which of these is a key innovation in GoogleNet?",
      type: "multiple_choice",
      options: [
        "Residual connections",
        "Inception modules",
        "Depthwise separable convolutions",
        "Attention mechanisms"
      ],
      correctAnswer: "Inception modules",
      explanation: "Inception modules are the key innovation in GoogleNet. These modules apply multiple filter sizes in parallel and concatenate the results."
    },
    {
      question: "How many layers does the original GoogleNet (Inception v1) have?",
      type: "multiple_choice",
      options: [
        "9",
        "22",
        "42",
        "152"
      ],
      correctAnswer: "22",
      explanation: "The original GoogleNet (Inception v1) has 22 layers (27 if counting pooling layers)."
    },
    {
      question: "GoogleNet was designed to be computationally efficient compared to previous architectures.",
      type: "true_false",
      correctAnswer: true,
      explanation: "True. One of GoogleNet's main goals was to create an efficient architecture that could run on devices with limited computational resources."
    },
    {
      question: "GoogleNet eliminated the need for fully connected layers entirely.",
      type: "true_false",
      correctAnswer: false,
      explanation: "False. While GoogleNet reduced the number of fully connected layers compared to previous architectures, it still used them in its final classification stage."
    },
    {
      question: "GoogleNet introduced the concept of 1×1 convolutions to reduce computational complexity.",
      type: "true_false",
      correctAnswer: true,
      explanation: "True. GoogleNet used 1×1 convolutions within its Inception modules to reduce the number of channels (and thus computations) before applying larger filters."
    },
    {
      question: "Explain the structure and purpose of the Inception module in GoogleNet.",
      type: "written",
      correctAnswer: "The Inception module is the core building block of GoogleNet that applies multiple filter sizes in parallel. It typically consists of 1×1, 3×3, and 5×5 convolution filters along with a 3×3 max pooling path. Before applying the larger filters (3×3 and 5×5), 1×1 convolutions are used to reduce the input dimensions, thereby decreasing computational cost. This approach allows the network to capture features at different scales simultaneously and lets the model decide which features are most important through training, rather than the designer having to choose specific filter sizes.",
      explanation: "A good answer should describe the parallel pathways, the role of 1×1 convolutions in dimension reduction, and why this design is beneficial."
    },
    {
      question: "Describe the auxiliary classifiers in GoogleNet and explain their purpose.",
      type: "written",
      correctAnswer: "Auxiliary classifiers in GoogleNet are additional smaller classification networks connected to intermediate layers of the main network. They were designed to address the vanishing gradient problem in deep networks by injecting additional gradients into the middle of the network during training. Each auxiliary classifier adds a loss term to the overall loss function, with a smaller weight (typically 0.3). This helps the gradients flow better through the network and provides regularization. During inference (prediction), these auxiliary classifiers are discarded, and only the final classifier is used.",
      explanation: "A good answer should explain what auxiliary classifiers are, why they were added (vanishing gradients), and how they're used during training vs. inference."
    },
    {
      question: "Compare and contrast GoogleNet (Inception v1) with Inception v3. What key improvements were made?",
      type: "written",
      correctAnswer: "Inception v3 improved upon the original GoogleNet (Inception v1) in several ways: 1) It factorized larger convolutions into smaller ones (e.g., 5×5 into two 3×3), reducing parameters and computational cost; 2) It introduced asymmetric convolutions (e.g., nx1 followed by 1xn) for further efficiency; 3) It used batch normalization more extensively; 4) It had an expanded width and included more Inception modules; 5) It used label smoothing as a regularization technique; 6) It improved the auxiliary classifiers. These changes resulted in significantly better performance while maintaining computational efficiency.",
      explanation: "A good answer should identify multiple architectural improvements between the versions."
    },
    {
      question: "Explain how GoogleNet addressed the computational efficiency concerns in deep neural networks.",
      type: "written",
      correctAnswer: "GoogleNet addressed computational efficiency through several innovative approaches: 1) Inception modules used 1×1 convolutions to reduce channel dimensions before applying expensive 3×3 and 5×5 filters, significantly reducing computation; 2) It reduced the use of fully connected layers, which contain the most parameters; 3) It utilized global average pooling at the end instead of multiple fully connected layers; 4) The architecture carefully balanced depth and width to maximize expressiveness while minimizing parameters; 5) The design favored sparse connections rather than dense ones. These innovations allowed GoogleNet to achieve state-of-the-art performance with 12x fewer parameters than previous architectures like AlexNet.",
      explanation: "A good answer should cover multiple efficiency techniques, particularly the role of 1×1 convolutions and the reduction of fully connected layers."
    }
  ]
}; 