const index = require('./index');

describe('lambda entry', () => {
  it('does something', async () => {
    const responseJson = await expect(index.handler({
      "currentIntent": {
        "slots": {
          "AppointmentType": "whitening",
          "Date": "2030-11-08",
          "Time": "10:00"
        },
        "name": "MakeAppointment",
        "confirmationStatus": "None"
      },
      "bot": {
        "alias": "$LATEST",
        "version": "$LATEST",
        "name": "MakeAppointment"
      },
      "userId": "John",
      "invocationSource": "DialogCodeHook",
      "outputDialogMode": "Text",
      "messageVersion": "1.0",
      "sessionAttributes": {}
    })).to.be.fulfilled;

    expect(JSON.parse(responseJson)).to.eql({
      message: 'Hello!'
    });
  });
});
