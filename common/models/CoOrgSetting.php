<?php

namespace common\models;

/**
 * This is the model class for table "co_org_setting".
 *
 * @property integer $org_setting_id
 * @property integer $org_id
 * @property string $code
 * @property string $key
 * @property string $value
 * @property string $notes
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 */
class CoOrgSetting extends GActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_org_setting';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['org_id', 'code', 'key', 'value'], 'required'],
                [['org_id', 'created_by', 'modified_by'], 'integer'],
                [['key', 'value', 'status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['code'], 'string', 'max' => 50],
                [['notes'], 'string', 'max' => 100],
        ];
    }

    public function getCoOrganization() {
        return $this->hasOne(CoOrganization::className(), ['org_id' => 'org_id']);
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'org_setting_id' => 'Org Setting ID',
            'org_id' => 'Org ID',
            'code' => 'Code',
            'key' => 'Key',
            'value' => 'Value',
            'notes' => 'Notes',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    public static function getConfigurations() {
        return array(
            'SHARE_ENCOUNTER' => [
                'code' => 'ENCOUNTER',
                'value' => '1',
                'notes' => 'Share Encounter',
            ],
            'SHARE_NOTES' => [
                'code' => 'NOTES',
                'value' => '1',
                'notes' => 'Share Notes',
            ],
            'SHARE_CONSULTANT' => [
                'code' => 'CONSULTANT',
                'value' => '1',
                'notes' => 'Share Consultant',
            ],
            'SHARE_ALERT' => [
                'code' => 'ALERT',
                'value' => '1',
                'notes' => 'Share Alert',
            ],
            'SHARE_VITALS' => [
                'code' => 'VITALS',
                'value' => '1',
                'notes' => 'Share Vitals',
            ],
            'SHARE_PRESCRIPTION' => [
                'code' => 'PRESCRIPTION',
                'value' => '1',
                'notes' => 'Share Prescription',
            ],
            'SHARE_BILLING' => [
                'code' => 'BILLING',
                'value' => '0',
                'notes' => 'Share Billing',
            ],
            'SHARE_PROCEDURE' => [
                'code' => 'PROCEDURE',
                'value' => '1',
                'notes' => 'Share Procedure',
            ],
            'SHARE_BASIC_DATA' => [
                'code' => 'BASIC',
                'value' => '1',
                'notes' => 'Share Basic Data',
            ],
        );
    }

}
