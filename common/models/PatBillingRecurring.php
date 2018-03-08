<?php

namespace common\models;

use common\models\query\PatBillingRecurringQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_billing_recurring".
 *
 * @property integer $recurr_id
 * @property integer $tenant_id
 * @property integer $encounter_id
 * @property integer $patient_id
 * @property integer $room_type_id
 * @property string $room_type
 * @property integer $charge_item_id
 * @property string $charge_item
 * @property string $recurr_date
 * @property string $charge_amount
 * @property string $status
 * @property integer $recurr_group
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 * @property string $executed_at
 *
 * @property CoRoomChargeItem $chargeItem
 * @property PatEncounter $encounter
 * @property PatPatient $patient
 * @property CoRoomType $roomType
 * @property CoTenant $tenant
 */
class PatBillingRecurring extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_billing_recurring';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['encounter_id', 'patient_id', 'room_type_id', 'room_type', 'charge_item_id', 'charge_item'], 'required'],
                [['tenant_id', 'encounter_id', 'patient_id', 'room_type_id', 'charge_item_id', 'created_by', 'modified_by'], 'integer'],
                [['recurr_date', 'recurr_group', 'created_at', 'modified_at', 'deleted_at', 'executed_at', 'created_by'], 'safe'],
                [['charge_amount'], 'number'],
                [['status'], 'string'],
                [['room_type', 'charge_item'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'recurr_id' => 'Recurr ID',
            'tenant_id' => 'Tenant ID',
            'encounter_id' => 'Encounter ID',
            'patient_id' => 'Patient ID',
            'room_type_id' => 'Room Type ID',
            'room_type' => 'Room Type',
            'charge_item_id' => 'Charge Item ID',
            'charge_item' => 'Charge Item',
            'recurr_date' => 'Recurr Date',
            'recurr_group' => 'Recurr Group',
            'charge_amount' => 'Charge Amount',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getChargeItem() {
        return $this->hasOne(CoRoomChargeItem::className(), ['charge_item_id' => 'charge_item_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getEncounter() {
        return $this->hasOne(PatEncounter::className(), ['encounter_id' => 'encounter_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPatient() {
        return $this->hasOne(PatPatient::className(), ['patient_id' => 'patient_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getRoomType() {
        return $this->hasOne(CoRoomType::className(), ['room_type_id' => 'room_type_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public function getAdmission() {
        return $this->hasMany(PatAdmission::className(), ['encounter_id' => 'encounter_id']);
    }

    public static function find() {
        return new PatBillingRecurringQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'branch_name' => function ($model) {
                return (isset($model->tenant) ? $model->tenant->tenant_name : '-');
            },
            'patient_name' => function ($model) {
                return (isset($model->patient) ? ucfirst($model->patient->patient_firstname) : '-');
            },
            'patient_uhid' => function ($model) {
                return (isset($model->patient) ? $model->patient->patient_global_int_code : '-');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

}
