<?php

namespace common\models;

use common\models\query\PatRefundPaymentQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_refund_payment".
 *
 * @property integer $refund_payment_id
 * @property integer $tenant_id
 * @property integer $encounter_id
 * @property integer $patient_id
 * @property string $refund_date
 * @property string $refund_amount
 * @property string $payment_mode
 * @property string $card_type
 * @property integer $card_number
 * @property string $bank_name
 * @property string $cheque_number
 * @property string $bank_date
 * @property integer $ref_no
 * @property integer $print_count
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 */
class PatRefundPayment extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_refund_payment';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['refund_amount'], 'required'],
                [['tenant_id', 'encounter_id', 'patient_id', 'card_number', 'ref_no', 'print_count', 'created_by', 'modified_by'], 'integer'],
                [['refund_date', 'bank_date', 'created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['refund_amount'], 'number'],
                [['payment_mode', 'status'], 'string'],
                [['card_type'], 'string', 'max' => 50],
                [['bank_name', 'cheque_number'], 'string', 'max' => 100],
                [['encounter_id'], 'exist', 'skipOnError' => true, 'targetClass' => PatEncounter::className(), 'targetAttribute' => ['encounter_id' => 'encounter_id']],
                [['patient_id'], 'exist', 'skipOnError' => true, 'targetClass' => PatPatient::className(), 'targetAttribute' => ['patient_id' => 'patient_id']],
                [['tenant_id'], 'exist', 'skipOnError' => true, 'targetClass' => CoTenant::className(), 'targetAttribute' => ['tenant_id' => 'tenant_id']],
                [['card_type', 'card_number'], 'required', 'when' => function($model) {
                    return $model->payment_mode == 'CD';
                }],
                [['bank_name', 'cheque_number', 'bank_date'], 'required', 'when' => function($model) {
                    return $model->payment_mode == 'CH';
                }],
                [['bank_name', 'ref_no', 'bank_date'], 'required', 'when' => function($model) {
                    return ($model->payment_mode == 'ON');
                }],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'refund_payment_id' => 'Refund Payment ID',
            'tenant_id' => 'Tenant ID',
            'encounter_id' => 'Encounter ID',
            'patient_id' => 'Patient ID',
            'refund_date' => 'Refund Date',
            'refund_amount' => 'Refund Amount',
            'payment_mode' => 'Payment Mode',
            'card_type' => 'Card Type',
            'card_number' => 'Card Number',
            'bank_name' => 'Bank Name',
            'cheque_number' => 'Cheque Number',
            'bank_date' => 'Bank Date',
            'ref_no' => 'Ref No',
            'print_count' => 'Print Count',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    public static function find() {
        return new PatRefundPaymentQuery(get_called_class());
    }

}
