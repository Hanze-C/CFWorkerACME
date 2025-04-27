import * as acme from 'acme-client';

export async function newApply() {
    const accountPrivateKey = '<PEM encoded private key>';
    const client = new acme.Client({
        directoryUrl: acme.directory.letsencrypt.staging,
        accountKey: accountPrivateKey,
    });
    const privateRsaKey = await acme.crypto.createPrivateRsaKey();
    const privateEcdsaKey = await acme.crypto.createPrivateEcdsaKey();
    const [certificateKey, certificateCsr] = await acme.crypto.createCsr({
        altNames: ['example.com', '*.example.com'],
    });



}




/*
acme.directory.buypass.staging;
acme.directory.buypass.production;

acme.directory.google.staging;
acme.directory.google.production;

acme.directory.letsencrypt.staging;
acme.directory.letsencrypt.production;

acme.directory.zerossl.production;
*/