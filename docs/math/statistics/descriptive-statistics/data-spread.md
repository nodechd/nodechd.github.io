---
sidebar_position: 2
---

# Data Spread

Mean, Mode, Median are measures of central tendency. They tell us where the center of the data is. However, they do not tell us how spread out the data is.

arr = [1.2, 1.5, 1.7, 1.9, 2.1, 2.1, 10.5]

Mean = 3.0, Median = 1.9, Mode = 2.1

### Range

Range is the difference between the maximum and minimum values in the data. It gives us a rough idea of how spread out the data is.

range = max(arr) - min(arr)

### Variance

Variance is the average of the squared differences from the mean. It gives us a more precise measure of how spread out the data is.

$$
\text{variance} = \frac{\sum_{i=1}^{n} (x_i - \mu)^2}{n}
$$

Where:
- \(x_i\) is each value in the data
- \(\mu\) is the mean of the data
- \(n\) is the number of values in the data


### Standard Deviation

Standard deviation is the square root of the variance. It gives us a measure of how spread out the data is in the same units as the data.

$$
\text{standard deviation} = \sqrt{\text{variance}}
$$

### Percentiles

Percentiles are values that divide the data into 100 equal parts. The 25th percentile (Q1) is the value below which 25% of the data falls, the 50th percentile (Q2) is the median, and the 75th percentile (Q3) is the value below which 75% of the data falls.

So in our arr = [1.2, 1.5, 1.7, 1.9, 2.0, 2.1, 10.5], Q1 = 1.7, Q2 = 1.9, Q3 = 2.1

In this equal divided parts, we can see that the data is not evenly distributed. The first 75% of the data is between 1.2 and 2.1, while the last 25% of the data is between 2.1 and 10.5. This shows that the data is skewed to the right.

### Interquartile Range (IQR)

Interquartile range (IQR) is the difference between the 75th percentile (Q3) and the 25th percentile (Q1). It gives us a measure of how spread out the middle 50% of the data is.

$$
\text{IQR} = Q3 - Q1
$$

### Z-Score

Z-score is a measure of how many standard deviations a value is from the mean. It tells us how far away a value is from the center of the data.

$$
\text{Z-score} = \frac{x - \mu}{\sigma}
$$

Where:
- x is the value
- mu is the mean
- sigma is the standard deviation