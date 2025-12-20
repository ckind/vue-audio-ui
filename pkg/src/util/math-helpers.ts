
function getBaseLog(base: number, x: number): number {
    return Math.log(x) / Math.log(base);
}

function fitToBounds(value: number, min: number, max: number) {
    if (value < min) {
        return min;
    } else if (value > max) {
        return max;
    }
    
    return value;
}

interface QuadraticResult {
    solution1: QuadraticRoot;
    solution2: QuadraticRoot;
}

interface QuadraticRoot {
    realPart: number;
    imaginaryPart: number; // 0 means the the number is real
}

function solveQuadratic(a: number, b: number, c: number): QuadraticResult {
    const root1 = { realPart: 0, imaginaryPart: 0 };
    const root2 = { realPart: 0, imaginaryPart: 0 };
    const discriminant = b * b - 4 * a * c;
    // condition for real and different roots
    if (discriminant > 0) {
        root1.realPart = (-b + Math.sqrt(discriminant)) / (2 * a);
        root2.realPart = (-b - Math.sqrt(discriminant)) / (2 * a);
    }
    // condition for real and equal roots
    else if (discriminant == 0) {
        root1.realPart = root2.realPart = -b / (2 * a);
    }
    // if roots are not real
    else {
        const realPart = (-b / (2 * a));
        const imagPart = (Math.sqrt(-discriminant) / (2 * a));
        root1.realPart = realPart;
        root1.imaginaryPart = imagPart;
        root2.realPart = realPart;
        root2.imaginaryPart = -imagPart;
    }
    return { solution1: root1, solution2: root2 };
}

function isPowerOfTwo(n: number) {
    return (n & (n - 1)) === 0;
}


function round(num: number, decimalPlaces: number): number {
    // Convert number to exponential string to handle large/small numbers
    const shifted = Math.round(Number(`${num}e${decimalPlaces}`));
    // Convert back to a number from exponential notation
    return Number(`${shifted}e${-decimalPlaces}`);
}

export { getBaseLog, solveQuadratic, fitToBounds, isPowerOfTwo, round };