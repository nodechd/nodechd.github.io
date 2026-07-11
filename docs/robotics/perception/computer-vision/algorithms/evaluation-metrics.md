---
sidebar_position: 2
---

# Evaluation Metrics

This focuses on evaluation metrics for computer vision algorithms in the context of segmentation.

Precision: It's the ratio of true positives to the sum of true positives and false positives.

Recall: It's the ratio of true positives to the sum of true positives and false negatives.

IOU (intersection over union): It's the ratio of the intersection to the union of predicted and ground truth.

DICE coefficient or F1-score: It's the ratio of twice the intersection to the sum of predicted and ground truth. It's also equal to the harmonic mean (2/(1/precision + 1/recall)) of precision and recall which is equal to 2 * (precision * recall) / (precision + recall).

### Derived Evaluation Metrics

cIOU (cumulative intersection over union): It's the ratio of the cumulative intersection to the cumulative union across the entire dataset. It disportionately considers larger objects in the dataset.

gIOU (global intersection over union): It's per sample IOU averaged across the entire dataset. More balanced than cIOU.

Precision in context of segmentation: It's the ratio of true positives to the sum of true positives and false positives. True positives could be selected based on a threshold utilizing IOU, cIOU, or gIOU.

mean Precision (mPrecision): It's the average of precision across the entire dataset.

Recall in context of segmentation: True positives could be selected based on a threshold utilizing IOU, cIOU, or gIOU.

mean Recall (mRecall): It's the average of recall across the entire dataset. 
