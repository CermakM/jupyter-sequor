# jupyter-sequor
Follow and scroll automatically cell outputs in Jupyter notebooks

## Installation

```python
pip install jupyter-sequor
```

## Usage

A minimal example:

> NOTE: The example requires additional package [lorem](https://pypi.org/project/lorem/).

```python
import lorem
import time

for a in range(0, 200, 10):
    text = lorem.text()
    print(text)

    time.sleep(0.2)
```

![Promo GIF](https://raw.githubusercontent.com/CermakM/jupyter-sequor/master/assets/images/promo.gif)

Note that the `Follow` button appears only when the cell enters a **scrolled** state.

Feel free to enable/disable the follow on a cell level by clicking the button.