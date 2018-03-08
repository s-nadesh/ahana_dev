<?php

namespace common\models;

/**
 * This is the model class for table "v_billing_recurring".
 *
 * @property integer $encounter_id
 * @property integer $room_type_id
 * @property string $room_type
 * @property integer $charge_item_id
 * @property string $charge_item
 * @property string $from_date
 * @property string $to_date
 * @property integer $duration
 * @property string $charge_amount
 * @property string $total_charge
 */
class VBillingRecurring extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'v_billing_recurring';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['encounter_id', 'room_type_id', 'room_type', 'charge_item_id', 'charge_item'], 'required'],
            [['encounter_id', 'room_type_id', 'charge_item_id', 'duration'], 'integer'],
            [['from_date', 'to_date'], 'safe'],
            [['charge_amount', 'total_charge'], 'number'],
            [['room_type', 'charge_item'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'encounter_id' => 'Encounter ID',
            'room_type_id' => 'Room Type ID',
            'room_type' => 'Room Type',
            'charge_item_id' => 'Charge Item ID',
            'charge_item' => 'Charge Item',
            'from_date' => 'From Date',
            'to_date' => 'To Date',
            'duration' => 'Duration',
            'charge_amount' => 'Charge Amount',
            'total_charge' => 'Total Charge',
        ];
    }

}
