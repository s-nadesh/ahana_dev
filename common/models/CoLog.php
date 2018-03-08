<?php

namespace common\models;

/**
 * This is the model class for table "co_log".
 *
 * @property integer $log_id
 * @property integer $tenant_id
 * @property string $event_occured
 * @property string $event_trigger
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 */
class CoLog extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_log';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['tenant_id', 'event_occured', 'event_trigger', 'created_by'], 'required'],
            [['tenant_id', 'created_by', 'modified_by'], 'integer'],
            [['status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at'], 'safe'],
            [['event_occured', 'event_trigger'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'log_id' => 'Log ID',
            'tenant_id' => 'Tenant ID',
            'event_occured' => 'Event Occured',
            'event_trigger' => 'Event Trigger',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

}
