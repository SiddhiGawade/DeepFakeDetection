import torch.nn as nn
from torchvision import models


class ImageDeepfakeDetector(nn.Module):
    """EfficientNet-B4 based deepfake image detector.

    Matches the architecture used during training:
    - Backbone: EfficientNet-B4 (pretrained=False for inference)
    - Classifier: Linear(1792 -> num_classes)
    - Input size: 224x224
    """

    def __init__(self, num_classes=2):
        super().__init__()
        self.backbone = models.efficientnet_b4(weights=None)
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(p=0.4, inplace=True),
            nn.Linear(1792, 256),
            nn.ReLU(),
            nn.Dropout(p=0.3),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        return self.backbone(x)
