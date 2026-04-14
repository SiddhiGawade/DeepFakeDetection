import torch
import torch.nn as nn
from torchvision import models

class AudioDeepfakeDetector(nn.Module):
    def __init__(self):
        super().__init__()
        
        self.backbone = models.resnet18(pretrained=False)  # pretrained=False for inference
        
        self.backbone.conv1 = nn.Conv2d(1, 64, kernel_size=7,
                                         stride=2, padding=3, bias=False)
        
        self.backbone.fc = nn.Sequential(
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, 2)
        )
    
    def forward(self, x):
        return self.backbone(x)
